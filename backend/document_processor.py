from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from pypdf import PdfReader
import faiss
import numpy as np
import os
from typing import List
import logging

logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2"
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        self.vector_store = None
        self.chunks = []

    def process_pdf(self, file_path: str) -> List[str]:
        """Process a PDF file and return text chunks"""
        try:
            logger.info(f"Processing PDF file: {file_path}")
            pdf = PdfReader(file_path)
            raw_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    raw_text += text

            if not raw_text.strip():
                logger.warning("No text extracted from PDF")
                return []

            self.chunks = self.text_splitter.split_text(raw_text)
            logger.info(f"Created {len(self.chunks)} chunks from PDF")
            return self.chunks

        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            raise

    def create_vector_store(self):
        """Create FAISS vector store from chunks"""
        try:
            if not self.chunks:
                logger.warning("No chunks available to create vector store")
                return

            logger.info("Creating vector store...")
            # Get embeddings for all chunks
            chunk_embeddings = self.embeddings.embed_documents(self.chunks)

            # Initialize FAISS index
            dimension = len(chunk_embeddings[0])
            self.vector_store = faiss.IndexFlatL2(dimension)

            # Add embeddings to index
            self.vector_store.add(np.array(chunk_embeddings))
            logger.info("Vector store created successfully")

        except Exception as e:
            logger.error(f"Error creating vector store: {str(e)}")
            raise

    def get_relevant_chunks(self, query: str, k: int = 3) -> List[str]:
        """Get most relevant chunks for a query"""
        try:
            if not self.vector_store or not self.chunks:
                logger.warning("No vector store or chunks available")
                return []

            # Get query embedding
            query_embedding = self.embeddings.embed_query(query)

            # Search in FAISS
            D, I = self.vector_store.search(
                np.array([query_embedding]), k
            )

            # Get relevant chunks
            relevant_chunks = [self.chunks[i] for i in I[0]]
            logger.info(f"Found {len(relevant_chunks)} relevant chunks")

            return relevant_chunks

        except Exception as e:
            logger.error(f"Error retrieving chunks: {str(e)}")
            return []

# Initialize global document processor
doc_processor = DocumentProcessor()
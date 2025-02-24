import logging
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from pypdf import PdfReader
import faiss
import numpy as np
import os
from typing import List, Optional

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class DocumentProcessor:
    def __init__(self):
        logger.info("Initializing DocumentProcessor")
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2"
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,  # Smaller chunks for more precise retrieval
            chunk_overlap=50,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        self.vector_store: Optional[faiss.IndexFlatL2] = None
        self.chunks: List[str] = []
        logger.info("DocumentProcessor initialized successfully")

    def process_pdf(self, file_path: str) -> List[str]:
        """Process a PDF file and return text chunks"""
        try:
            logger.info(f"Starting to process PDF: {file_path}")

            # Read PDF
            pdf = PdfReader(file_path)
            raw_text = ""
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    raw_text += text
                    logger.info(f"Extracted text from page {i+1}")
                else:
                    logger.warning(f"No text found in page {i+1}")

            if not raw_text.strip():
                logger.warning("No text content found in PDF")
                return []

            # Split text into chunks
            self.chunks = self.text_splitter.split_text(raw_text)
            logger.info(f"Created {len(self.chunks)} chunks")
            logger.debug(f"First chunk sample: {self.chunks[0][:100]}...")

            return self.chunks

        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
            raise

    def create_vector_store(self) -> bool:
        """Create FAISS vector store from chunks"""
        try:
            if not self.chunks:
                logger.warning("No chunks available to create vector store")
                return False

            logger.info(f"Creating vector store for {len(self.chunks)} chunks")

            # Get embeddings for all chunks
            logger.info("Generating embeddings...")
            chunk_embeddings = self.embeddings.embed_documents(self.chunks)
            logger.info(f"Generated {len(chunk_embeddings)} embeddings")

            # Initialize FAISS index
            dimension = len(chunk_embeddings[0])
            self.vector_store = faiss.IndexFlatL2(dimension)

            # Add embeddings to index
            self.vector_store.add(np.array(chunk_embeddings))
            logger.info(f"Vector store created with dimension {dimension}")

            return True

        except Exception as e:
            logger.error(f"Error creating vector store: {str(e)}", exc_info=True)
            raise

    def get_relevant_chunks(self, query: str, k: int = 3) -> List[str]:
        """Get most relevant chunks for a query"""
        try:
            if not self.vector_store or not self.chunks:
                logger.warning("No vector store or chunks available")
                return []

            logger.info(f"Searching for chunks relevant to query: {query[:50]}...")

            # Get query embedding
            query_embedding = self.embeddings.embed_query(query)

            # Search in FAISS
            D, I = self.vector_store.search(
                np.array([query_embedding]).astype('float32'), k
            )

            # Get relevant chunks
            relevant_chunks = [self.chunks[i] for i in I[0]]
            logger.info(f"Found {len(relevant_chunks)} relevant chunks")
            logger.info(f"Similarity scores: {D[0]}")

            return relevant_chunks

        except Exception as e:
            logger.error(f"Error retrieving chunks: {str(e)}", exc_info=True)
            return []

# Initialize global document processor
doc_processor = DocumentProcessor()
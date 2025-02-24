from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from pypdf import PdfReader
import faiss
import numpy as np
import os
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
        )
        self.vector_store = None
        self.chunks = []
        
    def process_pdf(self, file_path: str) -> List[str]:
        """Process a PDF file and return text chunks"""
        try:
            pdf = PdfReader(file_path)
            raw_text = ""
            for page in pdf.pages:
                raw_text += page.extract_text()
                
            self.chunks = self.text_splitter.split_text(raw_text)
            return self.chunks
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            raise
            
    def create_vector_store(self):
        """Create FAISS vector store from chunks"""
        try:
            if not self.chunks:
                return
                
            # Get embeddings for all chunks
            embeddings = self.embeddings.embed_documents(self.chunks)
            
            # Initialize FAISS index
            dimension = len(embeddings[0])
            self.vector_store = faiss.IndexFlatL2(dimension)
            
            # Add embeddings to index
            self.vector_store.add(np.array(embeddings))
            
        except Exception as e:
            logger.error(f"Error creating vector store: {str(e)}")
            raise
            
    def get_relevant_chunks(self, query: str, k: int = 3) -> List[str]:
        """Get most relevant chunks for a query"""
        try:
            if not self.vector_store:
                return []
                
            # Get query embedding
            query_embedding = self.embeddings.embed_query(query)
            
            # Search in FAISS
            D, I = self.vector_store.search(
                np.array([query_embedding]), k
            )
            
            # Return relevant chunks
            return [self.chunks[i] for i in I[0]]
            
        except Exception as e:
            logger.error(f"Error retrieving chunks: {str(e)}")
            return []

# Initialize global document processor
doc_processor = DocumentProcessor()

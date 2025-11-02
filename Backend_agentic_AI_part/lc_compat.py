"""
LangChain import compatibility helpers.

Use these imports to be version-agnostic between older LangChain (<0.1.x)
and newer releases (>=0.1.0 / 1.x) where community modules moved out.
"""

# FAISS vectorstore location changed to langchain_community in newer versions
try:
    from langchain_community.vectorstores import FAISS  # type: ignore
except Exception:
    try:
        from langchain.vectorstores import FAISS  # type: ignore
    except Exception as e:
        raise ImportError(
            "FAISS vectorstore not found. Install 'langchain-community' and "
            "import as 'from langchain_community.vectorstores import FAISS'."
        ) from e

# HuggingFaceEmbeddings lives in langchain_community in newer versions
try:
    from langchain_community.embeddings import HuggingFaceEmbeddings  # type: ignore
except Exception:
    try:
        from langchain.embeddings import HuggingFaceEmbeddings  # type: ignore
    except Exception:
        # Optional alias; only raise if user explicitly imports from here and it's missing
        HuggingFaceEmbeddings = None  # type: ignore

# Output parsers moved to langchain_core in newer versions
try:
    from langchain_core.output_parsers import PydanticOutputParser  # type: ignore
except Exception:
    try:
        from langchain.output_parsers import PydanticOutputParser  # type: ignore
    except Exception:
        PydanticOutputParser = None  # type: ignore

# Prompt templates live in langchain_core in newer versions
try:
    from langchain_core.prompts import PromptTemplate, ChatPromptTemplate  # type: ignore
except Exception:
    try:
        from langchain.prompts import PromptTemplate, ChatPromptTemplate  # type: ignore
    except Exception:
        PromptTemplate = None  # type: ignore
        ChatPromptTemplate = None  # type: ignore
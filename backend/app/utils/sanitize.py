"""
Input sanitization utilities to prevent XSS and injection attacks.
"""
import bleach
import re
from typing import Optional


def sanitize_html(text: Optional[str]) -> Optional[str]:
    """
    Remove all HTML tags from text.
    Use for user-provided text that shouldn't contain HTML.
    """
    if text is None:
        return None
    return bleach.clean(text, tags=[], strip=True)


def sanitize_markdown(text: Optional[str]) -> Optional[str]:
    """
    Allow basic markdown but strip dangerous HTML.
    Use for content that should support markdown formatting.
    """
    if text is None:
        return None
    # Allow only safe tags used in markdown
    allowed_tags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    allowed_attrs = {}
    return bleach.clean(text, tags=allowed_tags, attributes=allowed_attrs, strip=True)


def sanitize_filename(filename: Optional[str]) -> Optional[str]:
    """
    Sanitize filename to prevent path traversal attacks.
    """
    if filename is None:
        return None
    # Remove any path components
    filename = filename.replace('\\', '/').split('/')[-1]
    # Remove dangerous characters
    filename = re.sub(r'[<>:"|?*\x00-\x1f]', '', filename)
    # Prevent hidden files
    filename = filename.lstrip('.')
    return filename if filename else None


def validate_email_format(email: str) -> bool:
    """
    Basic email format validation.
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

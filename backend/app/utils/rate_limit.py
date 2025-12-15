"""
Rate limiting utility using slowapi.
Prevents brute-force attacks on authentication endpoints.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Create limiter instance using IP address as key
limiter = Limiter(key_func=get_remote_address)

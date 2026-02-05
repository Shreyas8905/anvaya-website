from typing import Any, Dict, Optional


class AnvayaException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or self.__class__.__name__.upper()
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        response = {
            "detail": self.message,
            "error_code": self.error_code,
        }
        if self.details:
            response["details"] = self.details
        return response


class NotFoundError(AnvayaException):
    def __init__(
        self,
        resource: str,
        identifier: Optional[str] = None,
        **kwargs: Any
    ) -> None:
        if identifier:
            message = f"{resource} with identifier '{identifier}' not found"
        elif kwargs:
            conditions = ", ".join(f"{k}='{v}'" for k, v in kwargs.items())
            message = f"{resource} not found ({conditions})"
        else:
            message = f"{resource} not found"
        
        super().__init__(
            message=message,
            status_code=404,
            error_code="NOT_FOUND",
            details={"resource": resource, **kwargs}
        )


class ValidationError(AnvayaException):
    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        **kwargs: Any
    ) -> None:
        details = kwargs
        if field:
            details["field"] = field
        
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
            details=details if details else None
        )


class AuthenticationError(AnvayaException):
    def __init__(self, message: str = "Authentication failed") -> None:
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR"
        )


class AuthorizationError(AnvayaException):
    def __init__(self, message: str = "Permission denied") -> None:
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR"
        )


class FileUploadError(AnvayaException):
    def __init__(
        self,
        message: str,
        filename: Optional[str] = None,
        **kwargs: Any
    ) -> None:
        details = kwargs
        if filename:
            details["filename"] = filename
        
        super().__init__(
            message=message,
            status_code=400,
            error_code="FILE_UPLOAD_ERROR",
            details=details if details else None
        )


class ExternalServiceError(AnvayaException):
    def __init__(
        self,
        service: str,
        message: str,
        **kwargs: Any
    ) -> None:
        full_message = f"{service} error: {message}"
        super().__init__(
            message=full_message,
            status_code=502,
            error_code="EXTERNAL_SERVICE_ERROR",
            details={"service": service, **kwargs}
        )


class DatabaseError(AnvayaException):
    def __init__(self, message: str, **kwargs: Any) -> None:
        super().__init__(
            message=message,
            status_code=500,
            error_code="DATABASE_ERROR",
            details=kwargs if kwargs else None
        )

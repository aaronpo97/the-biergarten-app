namespace Domain.Exceptions;

/// <summary>
/// Exception thrown when a resource conflict occurs (e.g., duplicate username, email already in use).
/// Maps to HTTP 409 Conflict.
/// </summary>
public class ConflictException(string message) : Exception(message);

/// <summary>
/// Exception thrown when a requested resource is not found.
/// Maps to HTTP 404 Not Found.
/// </summary>
public class NotFoundException(string message) : Exception(message);

// Domain.Exceptions/UnauthorizedException.cs

/// <summary>
/// Exception thrown when authentication fails or is required.
/// Maps to HTTP 401 Unauthorized.
/// </summary>
public class UnauthorizedException(string message) : Exception(message);

/// <summary>
/// Exception thrown when a user is authenticated but lacks permission to access a resource.
/// Maps to HTTP 403 Forbidden.
/// </summary>
public class ForbiddenException(string message) : Exception(message);

/// <summary>
/// Exception thrown when business rule validation fails (distinct from FluentValidation).
/// Maps to HTTP 400 Bad Request.
/// </summary>
public class ValidationException(string message) : Exception(message);
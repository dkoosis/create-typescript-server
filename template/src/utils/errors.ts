// File: /projects/create-typescript-server/template/src/utils/errors.ts

/**
 * Custom error handling utilities for the MCP server.
 * Provides consistent error types and handling throughout the application.
 */

/**
 * Standard error codes that can be used throughout the application
 */
export enum ErrorCode {
    NOT_FOUND = "not_found",
    INVALID_REQUEST = "invalid_request",
    INVALID_URI = "invalid_uri",
    INTERNAL_ERROR = "internal_error",
    UNKNOWN_TOOL = "unknown_tool",
    INVALID_ARGUMENT = "invalid_argument",
    MISSING_ARGUMENT = "missing_argument",
  }
  
  /**
   * Custom error class for MCP errors with status codes
   */
  export class MCPError extends Error {
    code: string;
    status: number;
  
    constructor(code: string, message: string, status: number = 400) {
      super(message);
      this.name = 'MCPError';
      this.code = code;
      this.status = status;
    }
  }
  
  /**
   * Safely handles an error and converts it to an MCPError if needed
   * Use this to wrap errors from external sources
   */
  export function handleError(error: unknown, defaultCode = ErrorCode.INTERNAL_ERROR, defaultMessage = "An unexpected error occurred"): MCPError {
    if (error instanceof MCPError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new MCPError(defaultCode, error.message || defaultMessage);
    }
    
    return new MCPError(defaultCode, defaultMessage);
  }
/**
 * Indicates that an exception can explicitly declare whether it is retryable.
 */
package foam.util.retry;

public interface Retryable {
  boolean isRetryable();
}


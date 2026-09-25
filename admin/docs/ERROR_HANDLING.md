# Error Handling

## Error model

Axios failures are converted to `AppError` by the shared normalizer. `AppError` carries a kind, status code, backend code, message, field errors, retryability, and the original cause.

Current error kinds cover validation, authentication, permission, not-found, conflict, rate-limit, server, network, timeout, cancelled, and unknown failures.

## Display ownership

### Forms

Field errors render inside the matching Formik fields. They do not also produce
a form-level message or toast.

### Mutations

General mutation errors use `reportError` and display one deduplicated toast.
Form mutations disable automatic notification, apply `error.fields` to Formik,
and report `error.message` only as a general failure.

### Queries

A query failure that blocks page content uses an inline error state with a retry action. Such a query sets `suppressGlobalError` to prevent a duplicate toast.

Other query failures are reported by the global React Query cache handler.

### Authentication

An expired authenticated session produces no toast and is handled by the session
synchronizer. Public sign-in credential failures are general errors and use one
toast rather than a field error.

### Render and unhandled errors

The application Error Boundary handles render failures. A registered `unhandledrejection` listener reports otherwise unhandled promise failures through the shared reporter.

## Rule

An error has one display owner. It must not appear simultaneously in a field, form message, inline query state, and toast.

## SwiftPay — Distributed Fintech Microservices
> Java, Spring Boot, Spring Cloud, Kafka, Redis, MySQL, Docker
- Optimized system resilience and achieved 99.9% data consistency across 5+ microservices by architecting a
Saga-based orchestration pattern to handle distributed transactions and automated rollbacks.
- Reduced backend latency by 40% and prevented service degradation under high load by implementing an API
Gateway with Redis-backed rate limiting (Leaky Bucket algorithm) and centralized JWT authentication.
- Engineered a high-throughput event-driven architecture using Apache Kafka to decouple the Transaction and
Notification services, enabling asynchronous processing of up to 500+ simulated events/sec.
- Eliminated race conditions and double-spending vulnerabilities in the Wallet service by implementing Pessimistic
Locking at the database level and ensuring idempotent API design for all financial operations.
- Streamlined deployment workflows by containerizing services with Docker, ensuring environment parity and re-
ducing onboarding setup time for new developers by 70%.

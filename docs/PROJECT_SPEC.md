# CampusFlow — Real-Time Campus Operations & Resource Coordination Platform

## 1. Project Overview

CampusFlow is a real-time campus operations platform designed to centralize campus resource management, maintenance operations, incident coordination, notifications, and administrative analytics.

The system provides different interfaces and permissions for students, faculty, technicians, security personnel, and administrators.

The primary objective is to demonstrate production-grade software engineering through real-time communication, transactional database operations, resource allocation algorithms, role-based access control, caching, background processing, and cloud deployment.

---

## 2. Core Objectives

* Centralize campus operational data.
* Manage rooms, laboratories, equipment, and other resources.
* Provide conflict-aware resource booking.
* Manage maintenance requests from reporting through resolution.
* Provide real-time status updates and notifications.
* Coordinate campus incidents and emergencies.
* Provide administrative analytics.
* Demonstrate scalable backend and distributed-system concepts.

---

## 3. User Roles

### Student

* View campus resources.
* View room/resource availability.
* Submit maintenance reports.
* View personal bookings.
* Receive notifications.
* View incident announcements.

### Faculty

* View and request campus resources.
* Create bookings for classes/events.
* Report maintenance issues.
* Receive operational notifications.
* View booking history.

### Technician

* View assigned maintenance tickets.
* Accept assignments.
* Update maintenance status.
* Add resolution notes.
* Mark issues as resolved.

### Security

* View active incidents.
* Create authorized security incidents.
* Monitor incident status.
* Receive emergency notifications.
* Update response status.

### Admin

* Manage users.
* Manage buildings and rooms.
* Manage resources.
* Approve/reject bookings where required.
* Manage maintenance tickets.
* Manage incidents.
* View analytics.
* Review audit logs.

---

## 4. Core Modules

### 4.1 Campus Management

The platform represents the physical campus hierarchy:

Campus → Building → Floor → Room → Resource

Each room/resource can have a current operational status.

Possible room statuses:

* AVAILABLE
* OCCUPIED
* BOOKED
* MAINTENANCE
* RESTRICTED

---

### 4.2 Resource Management

Resources may include:

* Classrooms
* Computer laboratories
* Seminar halls
* Auditoriums
* Projectors
* Laboratory equipment
* Other campus equipment

Users can search and filter resources by:

* Availability
* Capacity
* Type
* Building
* Required equipment
* Time

---

### 4.3 Booking System

Users with appropriate permissions can create resource bookings.

The system must:

* Validate resource availability.
* Detect overlapping bookings.
* Validate booking permissions.
* Prevent conflicting reservations.
* Maintain booking history.
* Support cancellation.
* Generate relevant notifications.

Bookings must be handled using transactional database operations to prevent race-condition-related double booking.

---

### 4.4 Resource Conflict & Reallocation Engine

When a resource becomes unavailable, CampusFlow identifies affected bookings and searches for compatible alternatives.

The replacement engine considers:

* Required capacity
* Required equipment
* Building/location
* Time availability
* Existing bookings
* Resource type
* Priority

The system ranks compatible alternatives and presents the best options to an authorized administrator.

---

### 4.5 Maintenance Management

Users can create maintenance tickets.

Ticket lifecycle:

REPORTED → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFIED → CLOSED

A ticket contains:

* Reporter
* Location
* Resource
* Issue description
* Priority
* Status
* Assigned technician
* Timestamps
* Resolution notes
* Verification information

The system should track the complete maintenance history.

---

### 4.6 Incident Management

Authorized users can create incidents such as:

* Fire
* Power failure
* Network outage
* Water leakage
* Security incident
* Infrastructure failure

Incident lifecycle:

CREATED → ACTIVE → RESPONSE_IN_PROGRESS → RESOLVED → CLOSED

Incidents are associated with campus locations and can trigger real-time notifications.

---

### 4.7 Real-Time Notifications

The system provides real-time notifications for important events.

Examples:

* Booking approved.
* Booking rejected.
* Booking conflict detected.
* Maintenance ticket assigned.
* Maintenance status changed.
* Incident created.
* Emergency announcement issued.
* Resource status changed.

WebSockets will be used for real-time communication.

Redis will support scalable event and real-time infrastructure.

---

### 4.8 Emergency Mode

Authorized personnel can activate an emergency incident.

Emergency mode provides:

* Prominent incident status.
* Affected location.
* Active response information.
* Real-time notifications.
* Incident timeline.
* Authorized status updates.

The emergency system is designed as a coordination and information system rather than an automated physical safety-control system.

---

### 4.9 Analytics

Administrators can view:

* Resource utilization.
* Booking statistics.
* Maintenance ticket volume.
* Average maintenance resolution time.
* Most frequently reported resources.
* Active incidents.
* Incident resolution statistics.
* Resource usage trends.

---

## 5. Primary User Workflow

### Maintenance + Resource Reallocation Workflow

1. A user reports that a resource is unavailable.
2. CampusFlow creates a maintenance ticket.
3. The resource status changes to MAINTENANCE.
4. The system identifies future bookings affected by the unavailable resource.
5. The conflict engine searches for compatible alternatives.
6. Compatible alternatives are ranked.
7. An administrator reviews the recommendations.
8. The affected booking is reassigned.
9. Relevant users receive real-time notifications.
10. The technician resolves the maintenance issue.
11. The resource is restored to AVAILABLE.
12. The complete event history remains available for auditing.

---

## 6. Non-Functional Requirements

### Security

* Passwords must never be stored in plaintext.
* Authentication must use secure access and refresh tokens.
* Role-based authorization must protect privileged operations.
* Input validation must be implemented.
* APIs must implement rate limiting where appropriate.
* Sensitive operations must be recorded in audit logs.

### Reliability

* Booking operations must be transactional.
* Important asynchronous operations must be retryable.
* Duplicate events should not create duplicate side effects.
* Critical operations should be logged.

### Performance

* Frequently accessed data should be cacheable.
* Database queries should use appropriate indexes.
* Large datasets should use pagination.
* Real-time updates should avoid unnecessary broadcasts.

### Scalability

The architecture should allow the application to scale horizontally as usage increases.

---

## 7. Technology Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend

* NestJS
* TypeScript
* REST APIs
* WebSockets

### Database

* PostgreSQL

### Caching and Real-Time Infrastructure

* Redis

### Background Processing

* BullMQ

### Authentication

* JWT
* Refresh tokens
* Role-Based Access Control

### Infrastructure

* Docker
* GitHub Actions
* AWS

---

## 8. Initial Architecture

```text
                    Next.js Frontend
                           |
                    REST / WebSocket
                           |
                    NestJS Backend
                           |
          +----------------+----------------+
          |                |                |
      PostgreSQL         Redis          Background
          |                |              Workers
          |                |                |
       Campus Data    Cache / Events     BullMQ
          |                |
          +----------------+
                   |
             External Services
             where required
```

The architecture may evolve as implementation requirements become clearer.

---

## 9. V1 Scope

V1 will focus on:

* Authentication
* Role-based access control
* Campus/building/room management
* Resource management
* Resource booking
* Booking conflict detection
* Maintenance tickets
* Technician assignment
* Incident management
* Real-time notifications
* Resource reallocation recommendations
* Admin dashboard
* Basic analytics
* Audit logging

Advanced features will be added only after the core system is stable.

---

## 10. Development Philosophy

CampusFlow should be developed as a production-oriented engineering project rather than a demonstration CRUD application.

Important architectural decisions must be documented and justified.

The project should include:

* Automated tests
* API documentation
* Database migrations
* Docker configuration
* CI/CD
* Error handling
* Logging
* Security controls
* Architecture documentation
* Performance considerations
* Deployment documentation

---

## 11. Success Criteria

CampusFlow will be considered V1-complete when a user can:

1. Authenticate securely.
2. Access functionality according to their role.
3. View campus resources.
4. Create and manage valid bookings.
5. Prevent conflicting bookings.
6. Report maintenance issues.
7. Assign and resolve maintenance tickets.
8. Create and manage incidents.
9. Receive real-time updates.
10. Detect affected bookings when resources become unavailable.
11. Receive ranked alternative resource recommendations.
12. View operational analytics through the admin dashboard.
13. Run the complete application using documented deployment instructions.

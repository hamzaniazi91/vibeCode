# System Patterns

## System Architecture
- Frontend: React components with Next.js for routing and server-side rendering
- Backend: Supabase for database and API operations
- Authentication: NextAuth.js integration
- Chatbot Integration: Twilio API
- Property Management: Integration with property management systems
- Payment Processing: Stripe integration

## Key Technical Decisions
- Use of Next.js for its routing capabilities and server-side rendering
- Supabase chosen for its managed database and API capabilities
- Twilio API integration for WhatsApp chatbot functionality
- Property management system integration for accurate property details
- Stripe integration for secure payment processing
- React components structured for reusability and modularity

## Design Patterns
- Separation of concerns between frontend and backend
- Use of hooks for state management (e.g., useProperty, useChat, usePayment)
- Component-based architecture for UI elements
- Context API for global state management (AuthContext, PropertyContext, PaymentContext)

## Component Relationships
- AuthContext manages user authentication state
- PropertyContext manages property details and interactions
- PaymentContext manages payment processing and transactions
- ProtectedRoute ensures only authenticated users access protected routes
- Chatbot components handle WhatsApp communication
- Dashboard components display property interactions and analytics
- Payment components handle Stripe integration and transactions

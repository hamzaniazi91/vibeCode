# Tech Context

## Technologies Used
- **Frontend**: React with Next.js for server-side rendering and routing
- **Backend**: Supabase for database and API operations
- **Authentication**: NextAuth.js with OAuth providers
- **Chatbot Integration**: Twilio API
- **Property Management**: Integration with property management systems
- **Payment Processing**: Stripe integration
- **UI/UX**: Tailwind CSS for styling
- **Build Tools**: ESLint, TypeScript, PostCSS

## Development Setup
- **Required Tools**: Node.js, npm, Git, VSCode, Twilio CLI
- **Environment Variables**: 
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_WHATSAPP_NUMBER`
  - `STRIPE_API_KEY`
  - `NEXTAUTH_SECRET`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Local Development**: 
  - `npm run dev` for frontend
  - Supabase CLI for local database
  - Twilio CLI for chatbot test

## Technical Constraints
- **Security**: 
  - Twilio API keys must be securely stored
  - Stripe API keys must be securely stored
  - Sensitive data must be encrypted
- **Performance**: 
  - Optimize API calls to Supabase
  - Minimize client-side data processing
  - Efficient handling of chatbot interactions
  - Optimize payment processing flow
- **Scalability**: 
  - Design for horizontal scaling
  - Use managed services where possible
  - Efficient message routing for high traffic
  - Scalable payment processing infrastructure

## Dependencies
- **Core Packages**: 
  - `twilio`
  - `@stripe/stripe-js`
  - `next-auth`
  - `supabase-js`
  - `typescript`
  - `eslint`
- **Versioning**: 
  - Use semantic versioning for package dependencies
  - Regularly update packages to latest stable versions

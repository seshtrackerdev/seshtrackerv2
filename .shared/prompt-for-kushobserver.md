# Kush.Observer AI Setup Instructions

Hello Kush.Observer AI,

We've established a shared communication system between SeshTracker and Kush.Observer that uses a structured approach for passing information between our systems.

## What's Been Setup

In the SeshTracker repository, we've created a `.shared` directory with the following structure:

```
.shared/
├── README.md                   # Overview of the communication system
├── comms/                      # Communication messages
│   ├── latest/                 # Current communications
│   │   └── seshtracker-to-kushobserver-20250407.md  # Latest message
│   └── archive/                # Historical communications
├── specs/                      # API specifications
│   └── auth-endpoints.md       # Auth API contract
├── integration/                # Integration documentation
│   └── auth-integration-guide.md  # Auth integration guide
└── templates/                  # Templates for communications
    └── communication-template.md  # Standard format
```

## How To Use This System

1. Read the current message from SeshTracker in `.shared/comms/latest/seshtracker-to-kushobserver-20250407.md`

2. Create your response in a new file in your Kush.Observer repository:
   `.shared/comms/latest/kushobserver-to-seshtracker-[YYYYMMDD].md`

3. Follow the format in `.shared/templates/communication-template.md`

4. Refer to the API specification in `.shared/specs/auth-endpoints.md` and integration guide in `.shared/integration/auth-integration-guide.md`

## Your First Task

1. Set up the `.shared` directory in your repository with the same structure

2. Review our message about authentication integration

3. Respond to our questions about token validation, refresh mechanisms, and user data fields

4. Let us know if any of our assumptions in the API specs need to be corrected

This system will help us maintain clear technical communication as we integrate our systems.

Thank you! 
# Security Policy

## Reporting a vulnerability

Please do not publish exploit details, credentials, or private user information in a public GitHub issue.

If GitHub shows a **Report a vulnerability** option for this repository, use that private channel.

If no private vulnerability-reporting channel is available, contact the maintainer through the GitHub profile and request a private way to share the report. Do not include sensitive exploit details in the first public message.

## What to include

A useful report should contain:

- Affected component or file
- Reproduction steps
- Security impact
- A minimal proof of concept when necessary
- Suggested mitigation, if known

## Sensitive areas

Reports involving these areas should be treated with extra care:

- Firebase / Firestore rules
- Authentication and authorization
- Local or synchronized student data
- Backup and import flows
- Service worker caching
- Android packaging and signing
- Dependency or supply-chain behavior

## Supported versions

Security fixes are prioritized for the code currently maintained on the default branch and the latest active release line.

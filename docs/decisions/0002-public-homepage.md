# Public homepage and workspace separation

Status: accepted for the next product surface.

## Decision

The public homepage is the default entry point. The operational workspace has its own `/workspace` entry point and remains lazy-loaded. Existing root-level workspace fragments continue to work so saved links from the foundation do not break.

Prerender the public React page during the build. It must explain the product without JavaScript and without contacting the farm API. Serve the workspace from a separate, non-indexed entry document. This adds no runtime dependency or public data endpoint.

ASSUMPTION: initial visitors arrive from the repository or shared product links. No advertising campaign, approved partner roster or public production domain was supplied. The primary action is to explore the field workspace, with its evaluation limits stated before entry. There is no enrolment, pricing or partner-contact form to invent.

## Content and imagery

The reader is a farmer, field worker or FPO member trying to understand what TerraFort does. The page must explain the missing link between a farm record and a preparedness action, then show the implemented workflow. Alerts and recovery remain product direction, not live capabilities.

Use the existing leaf identity, an explicitly labelled example of the actual farm-record interface, and the repository's rendered workspace screenshot. No external photography or unverifiable proof is introduced. The README becomes a product explanation; setup and test commands move to the developer guide.

## Verification

Check navigation, mobile disclosure, keyboard focus, FAQ operation, anchor links, browser history, existing workspace links and the full registration journey. Verify the built homepage with JavaScript disabled and with all API requests blocked. Test the public page at narrow widths and scan both desktop and mobile states. Keep the foundation's backend and skill tests in the pipeline.

The homepage does not make the operational product production-ready. Identity, deployment, offline synchronisation and approved local content retain their previous release gates.

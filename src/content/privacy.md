# Privacy Policy

_Last updated: 25 August 2026_

Memoryful is a personal journal. The entries it holds are among the more sensitive categories
of information a person can commit to software, and this policy is written accordingly: it
describes the actual handling of that information, rather than the general practices a
template would assume.

Questions about anything below may be directed to **vlad0307b@gmail.com**.

## Information we collect

**Account information.** Your email address. It is the sole requirement for access; the
service uses no passwords.

**Profile information, provided at your discretion.** Your first and last name, age, a short
biography, your country and city, and a profile image if you choose to upload one.

Age warrants a specific explanation, because it is the one field whose purpose is not
self-evident. It is used to keep the assistant's output appropriate to the person receiving
it. Recommendations suited to someone in full-time study differ from those suited to someone
in employment, and a portion of what the assistant might otherwise propose is not appropriate
for a minor under any circumstances. Supplying your age constrains the model's output; it is
not used for advertising or segmentation.

**Journal content.** The material you enter into a day: its description and written content,
uploaded images, tags, and trackables such as step counts or any other measure you define.

**Assistant conversations.** The messages you send to the assistant and the responses
generated in reply.

We do not collect your date of birth, gender, telephone number, or contacts, and the service
carries no advertising or analytics trackers.

## Where your information is held

- **Neon** — a managed PostgreSQL database hosted on AWS in `eu-central-1` (Frankfurt),
  holding your account, profile, journal entries, tags and trackables.
- **Google Cloud Storage** — a bucket in `europe-central2` (Warsaw), holding the images you
  upload.
- **Upstash Redis** — caching and session state, including the record of which sign-ins are
  currently active.
- **Resend** — delivery of email we send to you.

Regarding Resend: at present the only email the service sends is a sign-in code, which
contains no journal content. Should we later introduce digests or periodic summaries derived
from your entries, those messages would necessarily pass through Resend as well. This page
will be amended to say so before any such email is sent.

## Journal content is transmitted to AI providers

This is the most consequential disclosure in this policy, and it is stated separately for
that reason.

To produce daily insights, suggestions, and responses within the assistant, the relevant
journal content and your messages are transmitted to a third-party large language model
provider. The providers in use are:

- **OpenAI**
- **Anthropic**
- **Google**, via Vertex AI

Which provider receives a given request is determined by the model selected, which you can
view and change under **Settings → AI**. Requests are issued by our backend under our own
accounts, and each provider processes the content subject to its own terms and retention
practices.

If you would prefer that your entries not be transmitted to these providers, do not use the
insights, suggestions, or assistant features. The journal itself functions independently of
them.

## Signing in with Google

If you sign in with Google, Google supplies an identity token containing your email address,
confirmation of whether Google has verified it, your name, and Google's own account
identifier. The verified email address is used to locate or create your account.

We do not import your Google profile image, and we request no access to Gmail, Drive,
Calendar, or Contacts. Signing in with Google is optional; the email code method remains a
complete alternative.

## Sessions

Signing in stores a small file in your browser so that you remain signed in between visits.
It serves that purpose alone and is not used for advertising or for tracking you across other
websites. The devices currently signed in to your account are listed under
**Settings → Account**, where each may be signed out individually.

## Disclosure of your information

We do not sell your personal information, and we do not disclose it to third parties for
their own marketing purposes. It is shared only with the service providers named above, each
acting on our behalf to operate the service, and where disclosure is required by law.

Paid features are planned — access to certain assistant capabilities is expected to become
chargeable. Payment processing will be handled by an established payment provider rather than
by us, and this policy will describe that arrangement, including what the provider receives,
before any charge is made.

## Retention

Your account and its contents are retained until you ask us to remove them. Journal entries
are not expired or deleted on a schedule.

## Deletion

The service does not yet offer self-service deletion. To close your account, write to
**vlad0307b@gmail.com** from the address associated with it, and we will remove the account,
its journal content, and the images uploaded to it.

## Amendments

Where our handling of your information changes in a way that affects you, this page will be
revised and the date above updated.

## Contact

**vlad0307b@gmail.com**

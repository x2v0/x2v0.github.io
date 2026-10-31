# Prompts

The requests that drove this redesign, in order, verbatim.

1. > can you study this resume and redesign it to look proffesional: https://x2v0.github.io/ . let's discuss the design, typografics, functionality and content

   → Studied the site (HTML/CSS/JS, resume.md, screenshots). Result: `study/audit.md`.

2. > and content / content organization too

   → Added the content audit and a proposed one-page structure (see `decisions.md`).

3. > 1 both 2 both and make it switchabe 3 let's ship it where we can share with him easily on internet and an archive with all the sources prompts and studies and decisions we made. 4 can you do research

   Answers to the four open questions:
   1. Purpose: both job hunting (systems / DevOps) and academic credibility.
   2. Language: both Russian and English, switchable.
   3. Delivery: a shareable link on the internet, plus this archive.
   4. Missing facts: research them.

   → Research brief given to a research agent (summary in `research/facts.md`), then the build.

## Research brief (sent to the research agent)

Find verified, citable facts with numbers for each job: PROTOM proton therapy complex (installations, patients, what each of his programs did), ELVEES (Altel OS, Skif, Elbrus), JINR (SPD at NICA, lfspd, SpdCMake), CERN ROOT (his contributions, scale of ROOT, the 2009 vs 2011 paper), IHEP experiments, current metrics, education. Only facts with a source URL; mark anything uncertain as UNVERIFIED; note contradictions with resume.md.

3b. > unsupported ok, wrong no. explain me befre we through away stuff

   → Rule for claims; contradictions explained one by one before any change (see `decisions.md`).

4. > agree with all 4 / agree with everything / roles - he is looking for SWE type of role in academic institutuions

5. > physicist-programmer he was not physicist. I don't think we need to say he is looking for job. it's more passive lookng. make it something about a lot of experience in engieering and academia - unique co mbination of skills

6. > the design doesn't look good. do research on designs. I suspect it is because of you using artifact infra. the diagram seems to be unnessesary. research best pracitves for resume. and choose nice humanist-sans font
   > make a nice HTMl page
   > it needs to look stylish

   → Second design; see `study/resume-practices.md` and "Second design" in `decisions.md`.

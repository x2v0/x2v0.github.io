# Verified facts for the x2v0.github.io resume redesign

Subject: Valeriy Anatolyevich Onuchin (Валерий Анатольевич Онучин). GitHub x2v0, ORCID 0009-0000-3022-3529, Scopus authorId 8401982000.
Research date: 2026-10-30. Base text: https://x2v0.github.io/resume.md

Legend: **VERIFIED** = found in the cited source. **UNVERIFIED** = claimed in the resume or plausible, but no public source found. **CONTRADICTION** = a source disagrees with resume.md.

---

## 1. АО «ПРОТОМ» (Protom), Protvino, 2009–2021

### The company and the complex
- **VERIFIED.** АО «ПРОТОМ» "с 2001 года разрабатывает и серийно производит протонно-терапевтические комплексы для лучевой терапии онкологических заболеваний". Address: Протвино, Академический проезд, 2. Source: https://www.protom.ru/
- **VERIFIED.** The Protom synchrotron was developed by the Physical-Technical Center of the Lebedev Physical Institute (ФТЦ ФИАН) together with Protom Ltd., both in Protvino. It is used in three products: the Russian complex **«Прометеус» (Prometheus)** (Protom Ltd.), the US **"Radiance 330"** (ProTom International), and the Israeli **P-Cure** facility. Source: Pryanichnikov, Balakin et al., "Updated Status of Protom Synchrotrons for Radiation Therapy", RuPAC2021, doi:10.18429/JACoW-RuPAC2021-FRB05, https://proceedings.jacow.org/rupac2021/doi/JACoW-RuPAC2021-FRB05.html (PDF: https://proceedings.jacow.org/rupac2021/papers/frb05.pdf)
- **VERIFIED, synchrotron parameters (Table 3 of the RuPAC2021 paper):** proton energy 30–330 MeV; treatment energies 70–250 MeV; acceleration to 250 MeV in 0.9 s; up to 4×10⁹ protons per cycle; ring outer diameter **5 m**; weight **15 t**; average power during treatment **30 kW**. The paper calls it "the most compact synchrotron". 330 MeV allows full-body proton tomography. Source: same PDF.
- **VERIFIED.** The paper says the complex is a full stack: "beam delivery system, patient positioning and immobilization system, treatment planning system and all needed software". Patient positioning uses an **armchair** (seated position), a low-dose X-ray tube and a digital X-ray panel. Protom's own treatment planning system (TPS) uses Monte Carlo, supports GPU, and is the main TPS at МРНЦ. Source: same PDF.

### Where it is installed, with dates
All dates below come from the RuPAC2021 paper (frb05.pdf) unless another source is given.
- First technical run of the prototype synchrotron: **2003**.
- Technical runs in **2010** at Protvino City Hospital (Russia) and the Central Military Hospital, Ružomberok (Slovakia). Technical run at McLaren Hospital, Flint, MI, USA in **2011**.
- **Protvino City Hospital (Протвинская городская больница):** first patient irradiated in **2015**. Since 2017 it has been used only for biological research. Another source gives the start of proton therapy in Protvino as **23 November 2015**, with 20 patients treated by 8 April 2016 (search-result summary of a Russian medical paper by Gulidov/Balakin; I did not open the primary text, so treat the exact day and count as UNVERIFIED).
- **МРНЦ им. А.Ф. Цыба, Обнинск (A. Tsyb MRRC):** treatment started in **2016**. Head-and-neck patients are treated there daily. NMRRC's site calls Prometheus the only Russian proton accelerator at the centre: https://new.nmicr.ru/en/pacientam/metody-diagnostiki-i-lechenija/radiation-and-proton-therapy/
- **McLaren Proton Therapy Center, Flint, Michigan, USA:** patient treatment started in **2018**.
- **Massachusetts General Hospital, Boston, USA:** single-room "Radiance 330" system, clinical operation from **2020**. FDA 510(k) clearance for Radiance 330: https://www.biospace.com/protom-receives-u-s-fda-510-k-clearance-for-its-radiance-330-single-room-proton-therapy-system
- **Israel, P-Cure (Shilat):** the first Israeli proton therapy complex based on the Protom synchrotron launched in **2019**.
- **Summary:** clinical use in **3 countries (Russia, USA, Israel)**, with 2 Prometheus complexes in Russia.

### Patients treated
- **VERIFIED (as of 2021):** "Up to date more than **1000 patients** were irradiated worldwide most of which have been treated in Russia." Source: RuPAC2021 frb05.pdf.
- A ФИАН article mentions "более 800 пациентов" treated in Obninsk. I saw this only in a search summary (lebedev.ru/ksf.lebedev.ru), so its date is UNVERIFIED.
- I found **no public number newer than 2021**. A 2024 Physics-Uspekhi review (https://ufn.ru/en/articles/2024/9/c/) describes Prometheus work but gives no patient count in its abstract.

### What his software did in that system (from his own repos and docs)
- **3D DICOM viewer / converter `dicom2fmm`** (https://dicom2fmm.github.io, page https://dicom2fmm.github.io/fmmfile.htm), **VERIFIED:**
  - It converts CT scans into **FMM**, the internal format of the «Прометеус» complex. FMM is the input file for the «Система планирования протонной лучевой терапии» (treatment planning system).
  - An FMM file holds a 3D matrix of proton stopping power relative to water, plus contours, fraction count, doses, and other service data.
  - It can be created two ways: from a DAT file produced by the complex's built-in tomograph (seated patient, head-and-neck zone), or from a DICOM study from a standard industrial CT scanner (any patient position).
  - Features listed in its help: DICOM–DAT study fusion and comparison, a contour editor (tumour/target, critical organ, critical organ with allowed dose, etc.), tumour dose editing, multiplanar reconstruction (MPR) with a 3D cursor and MPR navigator, slice histograms, a gallery mode, and HU→stopping-power conversions (Linear, Schneider (Phys. Med. Biol. 41 (1996) 111), Heeteak). It is launched from «Рабочее место медицинского физика» (the medical physicist's workstation).
  - Requirements: .NET Framework 4.0; recommended Windows 7 x64, 4-core 3 GHz, 1920×1080 display (https://dicom2fmm.github.io/systemreq.htm).
- **AlignPatient**, the patient position-control system (https://github.com/x2v0/AlignPatient, docs https://x2v0.github.io/AlignPatient/HTML/intro.htm), **VERIFIED:**
  - A hardware/software system that fixes the patient's head and neck before the CT scan and **verifies the patient's position during irradiation**. It also gives two-way video and audio between patient and physician, and records breathing and pulse. The README says breathing is recorded "for synchronization with proton accelerator".
  - A netbook with a camera and microphone is mounted on the **patient chair («кресло»)**. `PatientDisplay.exe` streams to `DoctorDisplay.exe` on the physician's PC. A reference image taken before the CT is stored in a database. During treatment the live video is compared with that image and the difference is shown in red.
  - PatientDisplay runs in a fault-tolerant, continuous mode: it starts automatically and restarts itself after failures. DoctorDisplay is launched from the operator console program «Pult».
  - Technical details from the README and config: C#/.NET, DirectShow (WMVideo9 encoder), multicast UDP, TCP port 30043, ODBC database, pulse sensor read over a serial COM port at 115200 baud. File header: "Author: Valeriy Onuchin 29.12.2010", svn rev 333 dated 2011-12-28.
  - The resume also lists RTP and SIP. These are UNVERIFIED in the README, which mentions only multicast UDP and TCP.
- **TM / PFS protocol library** (https://github.com/x2v0/TM, docs https://x2v0.github.io/TM/docs), **VERIFIED:** a ".NET реализация сетевого протокола обмена данными TM внутри ускорительного комплекса" (protom.ru). `TM.dll` also contains PowerShell **Cmdlet** classes and can be used as a PowerShell module. A test server simulator (MainCSimulator / MainSimulator.NET) is needed to simulate irradiation. The name "PFS" does not appear anywhere in the repo or docs, so that label is UNVERIFIED.
- **MainCClient.NET** (https://github.com/x2v0/MainCClient.NET), **VERIFIED:** a client that loads an **irradiation (treatment) plan** from a file, sends it to the server, starts irradiation with pause, resume and cancel, and receives the results, all through TM.dll.
- **EBTfilm** (https://github.com/x2v0/EBTfilm, docs https://x2v0.github.io/EBTfilm/basicinfo.htm), **VERIFIED:** processes **Gafchromic EBT2/EBT3** dosimetry films. A scanned film (TIFF) is the input, and film darkening corresponds to absorbed dose. It analyses dose fields after irradiation **by the proton beam** and is built on ROOT (histograms of dose distributions and the analysis maths).
- Also public: **ROOT.NET** (https://github.com/x2v0/ROOT.NET), a C# bridge that embeds a ROOT TCanvas in a .NET Form.
- **Not found:** no public paper or Protom source names Onuchin. His role at Protom is supported only by his own repositories, which do reference protom.ru and the Prometheus complex.

---

## 2. АО НПЦ «ЭЛВИС» (ELVEES), 2025

- **"Альтель ОС": UNVERIFIED.** No public source mentions an OS called «Альтель». His GitHub profile lists company **"Altelos"** (https://api.github.com/users/x2v0), which is consistent with the name but not independent evidence.
- **Based on ALT Linux: partly VERIFIED, indirectly.** His public repo **x2v0/mkimage-profiles-skif** (https://github.com/x2v0/mkimage-profiles-skif, created 2025-09-04, described as "mkimage-profile feat-mcom03-1.6.10-alt1 branch") is a copy of ALT's `mkimage-profiles`, whose README states its task as "конфигурирование и создание образов на базе ALT Linux". The repo adds **8 Skif image targets** (`vm/regular-{builder,gnome,icewm-sysv,kde,lxde,mate,xfce}-skif` and `vm/regular-router-skif`) with kernel flavour **`mcom03-6.6`** (Linux 6.6) in `conf.d/regular-vm.mk`. It has a single "initial commit", so authorship of individual lines cannot be separated.
- **ALT Linux / Базальт СПО:** ALT supports Elbrus (e2kv3/e2kv4/e2kv5), aarch64 and other architectures in the Sisyphus repository (search summary of a Habr article). Basealt site: https://www.basealt.ru
- **Скиф (Skif / "Scythian"), 1892ВА018, VERIFIED:**
  - ELVEES's support page for СКИФ links the "СнК 1892ВА018" manual and a Linux SDK, and its Buildroot download path is `dist.elvees.com/mcom03/`. This ties Skif to the internal name MCom-03. Source: https://support.elvees.com/docs/Microchips/SKIF/
  - Wikipedia: 1892VA018 "Scythian" has **4× ARM Cortex-A53 + PowerVR GPU** and **2× ELcore-50 DSP**, and is "intended for smart cameras, robotic systems, industrial automation". Source: https://en.wikipedia.org/wiki/ELVEES_Multicore
  - CNX Software (May 2025): quad-core Cortex-A53, **28 nm**, Imagination PowerVR Series8XE GPU, two DSPs, 4K60 video, supports **Alt Linux** and Buildroot (on the ELTAY SC board). Source: https://www.cnx-software.com/2025/05/21/eltay-sc-sbc-russian-alternative-raspberry-pi-elvees-skif-scythian-soc/
  - Clock speed differs by source: 1.2 GHz (Wikipedia table), up to 1.8 GHz (Tom's Hardware, per search summary), 2 GHz (CNX). **Don't quote a frequency.**
- **Эльбрус-2000 (e2k), VERIFIED:** a Russian microprocessor by **МЦСТ (MCST)**, launched in 2007, with a **VLIW** architecture (up to 20 instructions per clock natively) and x86 support through dynamic binary translation. Source: https://en.wikipedia.org/wiki/Elbrus_2000
- **Context, VERIFIED (news):** in **September 2024** АО «МЦСТ» (the Elbrus developer) was placed under **external management by АО НПЦ «ЭЛВИС»**, which explains why ELVEES worked on Elbrus targets in 2025. Sources: https://ru.themoscowtimes.com/2024/09/30/zasriv-oboronzakaza-razrabotchika-protsessorov-elbrus-peredali-pod-vneshnee-upravlenie-a143529 and https://www1.ru/news/2024/10/04/razrabotcik-processorov-elbrus-peresel-pod-vnesnee-upravlenie-dlia-soxraneniia-kompanii.html. A Feb 2026 report says MCST was released from external management by the end of 2025: https://www1.ru/news/2026/02/12/u-razrabotcika-processorov-elbrus-smenilsia-gendirektor-posle-sluxov-o-sryve-srokov-gosoboronzakaza.html
- **His work on Elbrus at ELVEES: UNVERIFIED.** No public artifact found. Only the Skif/aarch64 work has a public trace.

---

## 3. ОИЯИ / JINR, 2022–2024 (SPD at NICA)

- **SPD, VERIFIED:** "Technical Design Report of the Spin Physics Detector at NICA", arXiv:2404.08317 (12 Apr 2024), published in Natural Sci. Rev. 1 1 (2024). It has **417 authors**, including "V. Onuchin" (INSPIRE affiliation: Dubna, JINR). SPD is a universal detector at NICA's **second interaction point** for studying the spin structure of the proton and deuteron with polarized beams at **√s up to 27 GeV** and **luminosity up to 10³² cm⁻²s⁻¹**. Source: https://arxiv.org/abs/2404.08317. INSPIRE shows 72 citations.
- **lfspd ("Linux From Scratch Parallel Distributed"), VERIFIED:**
  - Two repos exist: **lfspd/lfspd** (https://github.com/lfspd/lfspd, created **2024-03-19**, i.e. during the JINR period, described as "Minimalistic Linux with major HEP, software packages for Docker") and **x2v0/lfspd** (https://github.com/x2v0/lfspd, created 2025-07-03, last push 2026-04-22).
  - README (both repos): a Linux rootfs for **Docker** containers. It is intended for "hundreds of thousands of such dockers/jobs" on a distributed cluster, and can also run in chroot/proot or WSL2. Everything is built from source, size-optimized and stripped, with no X11/GUI/man pages/locales. It is based on linuxfromscratch.org.
  - README numbers: **"> 170 packages"**, distribution size **~4.2 GB**, of which **2.2 GB** is Geant4 data kept on Docker volumes. The x2v0/lfspd description says "170+ пакетов, ~4.2 ГБ".
  - `Readme/packages.md` lists **159** packages and notes "The list is not full". The repo tree has build scripts organised by LFS chapters 5–10. Chapter 10 holds the HEP stack: **ROOT, Geant4, Pythia8, Gaudi, Acts, DD4hep, EDM4hep, podio, HepMC/HepMC3, HepPDT, KFParticle, EvtGen, FastJet, VecGeom, VC, GeoModel**, plus k4FWCore, k4Gen, k4SimGeant4 and FCCDetectors in packages.md. Chapter 9 holds scientific libraries: Boost, Eigen, FFTW, GSL, HDF5, OpenBLAS, TBB, xerces-c, CLHEP, etc. Source: https://github.com/x2v0/lfspd/blob/main/Readme/packages.md and the repo tree.
  - Documented use case: **Pythia8 event generation with full Geant4 simulation inside the lfspd container** (Readme/RunP8G4.md).
- **SpdCMake: UNVERIFIED.** https://git.jinr.ru/x2v0/SpdCMake answers HTTP 302, the GitLab API returns "404 Project Not Found", and user lookup returns nothing. It is either private or needs a login. The link will not work for anonymous visitors.
- CI/CD pipelines for SPD (resume claim): **UNVERIFIED**, no public trace found.

---

## 4. CERN 2004–2008 / ROOT

### His contributions, VERIFIED from ROOT's own source and credits
- **ROOT `README/CREDITS`** (https://github.com/root-project/root/blob/master/README/CREDITS) says: "N: Valeriy Onuchin … D: **port of ROOT GUI to Win32** using Win32 version of GDK/GLIB; various contributions to GUI classes (scrolled text in TGTextEntry); **implementation of Qt like signals and slots mechanism (TQObject, TQConnection, etc.)**; author of **Carrot**".
- **ROOT "Previous developers" page** (https://root.cern/about/previous_developers): "Valeri worked as a project associate on many different aspects of ROOT, but mostly in the GUI and graphics area. He did develop the **signal/slot functionality and the GUI builder**. He also developed the **Carrot** ROOT enabled web server."
- **ROOT Users Guide preface** (e.g. https://github.com/root-project/root/blob/v6-24-00-patches/documentation/users-guide/Preface.md): "Valeriy Onoutchin has been working on several ROOT packages, in particular the graphics sub-system for Windows and the GUI Builder (since 2000)."
- **Author headers in current ROOT master:**
  - `TASImage.cxx` (Fons Rademakers, Reiner Rohlfs, Valeriy Onuchin, 28/11/2001)
  - `TGWin32.cxx` (Brun, Couet, Rademakers, Onuchin, Bellenot, 27/11/01)
  - `TRootGuiBuilder.cxx` (Valeriy Onuchin, 12/09/04)
  - `TQObject.cxx` (Valeriy Onuchin & Fons Rademakers, 15/10/2000)
  - `TGHtml.cxx` (Valeriy Onuchin, 03/05/2007), the HTML widget
  - `TImageDump.cxx` (Valeriy Onuchin)
  - `TX11GL` (Valeriy Onuchin)
  - `builtins/libAfterImage/COPYRIGHT`: "Copyright (c) 2004 Valeriy Onuchin"
- **GitHub code search** ("Onuchin" in root-project/root) returns **90 files**, including the guibuilder, guihtml, win32gdk, asimage, the TQObject signal/slot files and image tutorials. (`gh api search/code`, run 2026-10-30.)
- **Commit history:** GitHub commit search for "onuchin" in root-project/root returns **522 commits**. They were committed by core developers (Rademakers, Antcheva, Couet, Bellenot) with messages like "From Valeriy Onuchin:". They span **2000-10-17** ("give credit to Valeriy Onuchin for the signal/slot implementation") to **2009-03-12**, plus a 2014 credit commit.
- **Carrot, VERIFIED:** SourceForge project "carrot", described as "ROOT Apache is an open source scripting module for the Apache webserver", "Brought to you by: onuchin", registered **2001-05-26**. Source: https://sourceforge.net/projects/carrot/
- **QtRoot: credit belongs mainly to Valeri Fine (BNL/STAR).** Fine's ROOT workshop slides describe TGQt/QtRoot as developed and supported by the STAR collaboration at BNL: https://indico.cern.ch/event/13356/contributions/1359428 . No source confirms Onuchin's role in QtRoot. The resume link https://www.gnome-look.org/p/1131848/ renders an empty placeholder page with only the title "QtRoot". **UNVERIFIED, and the link is weak.**
- **RDBC: UNVERIFIED.** No source found in this pass.

### Dates, CONTRADICTION
- Fons Rademakers on roottalk, **10 Dec 2001**: "Carrot development will get a big boost next year when Valeriy Onuchin will join the ROOT team in **January [2002] at CERN**." https://root.cern.ch/root/roottalk/roottalk01/4502.html
- ROOT weekly meeting, **8 July 2005**, Rene Brun's notes: "**Valeriy Onuchin departure.** Valeriy will (very likely) continue to work closely with us from Protvino (may be with Alice)." https://indico.cern.ch/event/424813/
- So CERN on-site work appears to be about **2002–2005**, with remote contributions from Protvino through about 2009. The resume says "ЦЕРН 2004–2008" and lists ИФВЭ until 2004. The CERN period should be confirmed with Valeriy. A safer framing: "ROOT contributor 2000–2009; at CERN in the ROOT team from 2002".

### ROOT scale facts
- **VERIFIED:** "Exabytes of scientific data are written in columnar ROOT format." ROOT README: https://github.com/root-project/root/blob/master/README.md
- **VERIFIED:** "ROOT provides the common file format for the data of all the LHC experiments, currently hosting **more than 1 EB** of LHC data". "ROOT for the HL-LHC: data format", arXiv:2204.04557 (2022): https://arxiv.org/abs/2204.04557
- **CONTRADICTION/UNVERIFIED:** the resume says "более 2 эксабайт". The citable figure is ">1 EB (2022)" or "exabytes".
- **VERIFIED:** "Every day, thousands of physicists use ROOT applications". https://root.cern/about/
- **UNVERIFIED:** "сотни тысяч пользователей" and "более 4 миллионов линий C++ кода". No source found, and Open Hub returned 403.
- **Higgs, VERIFIED (via RooFit/RooStats, which are part of ROOT):** the CHEP 2013 abstract says these tools were "used by them to produce numerous physics results, the discovery of the Higgs boson by ATLAS and CMS … using models with more than 1000 parameters". https://indico.cern.ch/event/214784/contributions/1512573 (plus RooFit workshop slides https://indico.cern.ch/event/218693/contributions/1520322/). Note that his own code (GUI, graphics) is not RooFit.

### The ROOT paper(s)
- **2009 (main paper), VERIFIED:** I. Antcheva et al. (27 authors, Onuchin 23rd), "ROOT — A C++ framework for petabyte data storage, statistical analysis and visualization", **Comput. Phys. Commun. 180 (2009) 2499–2512**, doi:10.1016/j.cpc.2009.08.005, PII S0010465509002550. Citations: Crossref 437, INSPIRE 571. https://doi.org/10.1016/j.cpc.2009.08.005
- **2011 (a separate item, not an erratum), VERIFIED:** same title and authors, **Comput. Phys. Commun. 182 (2011) 1384–1385**, doi:10.1016/j.cpc.2011.02.008, PII S0010465511000701. It is a **2-page "new version" program announcement** for ROOT v5.28.00 (CPC program library AEFA_v2_0, superseding AEFA_v1_0 = the 2009 paper). Citations: Crossref 137, INSPIRE 160. https://doi.org/10.1016/j.cpc.2011.02.008
- **CONTRADICTION:** the resume cites "Antcheva et al., … **2011**" but links to the **2009** article (PII S0010465509002550). Cite it as 2009, CPC 180, 2499.

---

## 5. ИФВЭ / IHEP, Protvino, 1987–2004

Sources: ORCID works (Scopus-fed), INSPIRE-HEP, Crossref. All INSPIRE records for these papers give his affiliation as "Serpukhov, IHEP" unless noted otherwise.
- **PHENIX (RHIC, BNL), VERIFIED.** INSPIRE lists **58 PHENIX-collaboration records**. Calorimeter papers include:
  - "PHENIX shish-kebab EM calorimeter" (IEEE NSS 1995)
  - "Performance of the PHENIX EM Calorimeter" (IEEE TNS 1996, doi:10.1109/23.507090)
  - "Calibration and monitoring system for the PHENIX lead-scintillator EM calorimeter" (1997/98)
  - "Pattern recognition in the PHENIX PbSc electromagnetic calorimeter" (IEEE TNS 2000, doi:10.1109/23.903833)
  - "PHENIX calorimeter" (NIM A 2003, doi:10.1016/S0168-9002(02)01954-X)
  - "PHENIX detector overview" (NIM A 2003)

  Physics papers include "Suppression of hadrons with large transverse momentum in central Au+Au collisions at √sNN = 130 GeV" (PRL 88, 022301, 2002) and "Formation of dense partonic matter … at RHIC" (Nucl. Phys. A 2005, the PHENIX white paper). ORCID: https://orcid.org/0009-0000-3022-3529
- **MINOS (Fermilab), VERIFIED:**
  - "The MINOS scintillator calorimeter system" (IEEE TNS 2002)
  - "Observation of muon neutrino disappearance with the MINOS detectors in the NuMI neutrino beam" (PRL 97, 191801, 2006; INSPIRE 962 citations)
  - "First observations of separated atmospheric ν_μ and ν̄_μ events in the MINOS detector" (PRD 73, 072002, 2006)
  - "The magnetized steel and scintillator calorimeters of the MINOS experiment" (NIM A 2008, doi:10.1016/j.nima.2008.08.003)
  - The MINOS Detectors TDR
- **Комплекс Меченых Нейтрино (KMN / Tagged Neutrino Facility, IHEP U-70), VERIFIED:**
  - "Measurements of the charge asymmetry of the Dalitz plot parameters for K± → π±π⁰π⁰ decays", EPJ C (2005), doi:10.1140/epjc/s2005-02138-8, and Phys. At. Nucl. (2005)
  - "Study of K± → e±νπ⁰ decays at the KMN setup", Phys. At. Nucl. 71 (2008), doi:10.1134/S1063778808120089
  - "Search for direct CP violation in charged K → 3π decays at the IHEP 70-GeV accelerator" (Tagged-Neutrino collaboration, INSPIRE)
- **Гиперон-М (U-70), VERIFIED:** "A multicomputer data acquisition complex based on MISS and SUMMA electronics for the Hyperon-M experiment", Instrum. Exp. Tech. 50 (2007), doi:10.1134/S0020441207050041. Note that this is a **DAQ/software** paper, which suits a software-engineer resume.
- **Calorimeter R&D, VERIFIED:**
  - "A fine grain gas ionization calorimeter" (NIM A 1993, doi:10.1016/0168-9002(93)90261-F)
  - "A hadron gas ionization calorimeter" (PTE 1993)
  - "First investigation of the gas ionization EM calorimeter using heavy freon C3F8" (1997)
  - "Composite scintillators for high-precision calorimetry" (1999)
  - GEPARD EM calorimeter module studies (INSPIRE)
- **Not in the resume but found (INSPIRE, IHEP affiliation):**
  - **ATLAS**: Technical Proposal; Calorimeter Performance TDR; Detector & Physics Performance TDR vol. 1; Computing Technical Proposal
  - **ALICE**: "The ALICE experiment at the CERN LHC", JINST 3 S08002 (2008), 1162 authors, INSPIRE ~4761 citations; and the ALICE EMCal TDR
  - **EMPACT** Letter of Intent for the SSC
  - These share the same name and the IHEP affiliation, so they are very likely his, but please confirm before adding.
- **KEK: UNVERIFIED.** No KEK-related publication found.

---

## 6. Metrics

- **Scopus (authorId 8401982000): not reachable.** The page redirects to an Elsevier login. ORCID confirms the Scopus Author ID 8401982000 is linked to this ORCID record. The resume figures (84 documents, >14,800 citations, h = 43) are **UNVERIFIED** in this pass.
- **ORCID** (pub.orcid.org v3.0 /works, 2026-10-30): **78 work groups**, all sourced from Scopus. They include duplicates of the same paper (e.g. PRL items with "[Formula presented]" titles), so the distinct-paper count is somewhat lower. Years run from 1993 to 2024. https://pub.orcid.org/v3.0/0009-0000-3022-3529/works
- **OpenAlex** (author A5041567230, "V. A. Onuchin", last institution IHEP): **81 works, 15,032 citations, h-index 47, i10 57.** https://api.openalex.org/authors/A5041567230. This is a public, citable alternative to Scopus, and its numbers are close to the resume's.
- **INSPIRE-HEP** (query "a V.A.Onuchin or a Onuchin, V"): **101 records**, total citations **27,551**. This includes collaboration TDRs (ATLAS, ALICE) and is split across several unclaimed INSPIRE author IDs, so use it with care.
- **Habr article, VERIFIED:** «40 лет анализа больших объёмов данных в Физике Высоких Энергий: интервью с Рене Браном», published **1 April 2020** (2020-04-01T09:37 UTC). Author account **xtovo**, labelled «Из песочницы» (his first, sandbox post). Stats at fetch time: 3,894 views, 12 bookmarks, 4 comments. https://habr.com/ru/articles/495090/

---

## 7. Education

- **Харьковский национальный университет им. В.Н. Каразина, физико-технический факультет, 1981–1987, «экспериментальная ядерная физика»: UNVERIFIED** (no public record of him found).
- **Context, VERIFIED:** the faculty (now "School of Physics and Technology") was formed in **1962** from the university's nuclear-physics department, which was created in 1948 on Kurchatov's initiative. It works closely with ХФТИ (KIPT). Sources: https://en.wikipedia.org/wiki/School_of_Physics_and_Technology_of_University_of_Kharkiv and https://vant.kipt.kharkov.ua/ARTICLE/VANT_2006_1/article_2006_1_199.pdf

---

## Contradictions and weak spots in resume.md

1. **lfspd package count:** the resume says "200+ пакетов" (DevOps table) and "~200 пакетов" (JINR section). The repo README and description say **">170" / "170+"**, and packages.md lists 159. Use "170+".
2. **ROOT paper year:** the text says 2011 but the link points to the 2009 paper (CPC 180, 2499). The 2011 item is a separate 2-page v5.28 update.
3. **CERN dates:** the resume has 2004–2008. Sources show a planned join in **January 2002** and a recorded **departure in July 2005**, with remote contributions to ~2009. ИФВЭ "1987–2004" also overlaps with that.
4. **"Более 2 эксабайт" in ROOT files:** the best source says ">1 EB" (2022), and the ROOT README says "Exabytes". Avoid the specific "2".
5. **"Сотни тысяч пользователей", "4 миллиона строк":** no source found. root.cern says "thousands of physicists" daily.
6. **QtRoot:** publicly attributed to Valeri Fine (BNL/STAR). The gnome-look link is an empty placeholder page. Either clarify his part or drop it.
7. **"Windows-версия ROOT":** CREDITS phrases it as the "port of ROOT GUI to Win32 using Win32 version of GDK/GLIB", and TGWin32 has 5 co-authors. Suggested wording: "Windows GUI/graphics port (TGWin32)".
8. **AlignPatient protocols RTP, SIP:** not in the README or config, which show multicast UDP, TCP, DirectShow, ODBC and a COM-port pulse sensor.
9. **"PFS/TM":** "PFS" does not appear in the TM repo. The repo calls it the "TM" protocol.
10. **SpdCMake link:** git.jinr.ru requires login, so it is broken for the public.
11. **Альтель ОС:** no public source. The only trace is the GitHub company "Altelos" and the mkimage-profiles-skif repo.
12. **Missing from the resume:** **signals/slots (TQObject)**, which is the most-cited contribution in ROOT's own credits; the **TGHtml** widget; the libAfterImage co-copyright; ATLAS and ALICE TDR authorship; and the Hyperon-M DAQ paper.

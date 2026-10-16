import { Language } from '../types';

export const I18N = {
  en: {
    brand: 'Justice Clock',
    nav_home: 'Home',
    nav_tracker: 'Case Tracker',
    nav_about: 'About',
    nav_action: 'Take Action',
    h1: 'How Long Have We Been Waiting for Justice?',
    sub: 'Behind every incident is a human life, a family, and the hope for justice.',
    intro:
      'Justice Clock shows how much time has passed since reported incidents and gathers publicly verifiable information about each case in one place. It exists to encourage transparency and awareness.',
    btn_explore: 'Explore Cases',
    btn_mission: 'Our Mission',
    clock_label: 'Time since a fictional demo incident',
    demo_tag: 'DEMO',
    clock_note:
      'The timer shows time since the reported incident, not the length of a court case.',
    demo_label: 'FICTIONAL DEMO DATA — NOT A REAL CASE',
    u_d: 'days',
    u_h: 'hours',
    u_m: 'minutes',
    u_s: 'seconds',
    stats_title: 'The picture at a glance',
    s1: 'Cases tracked',
    s2: 'Under investigation',
    s3: 'Trials ongoing',
    s4: 'Judgments reported',
    stats_note:
      'Demo statistics for design preview only. Not official statistics.',
    feat_title: 'Featured case timers',
    feat_sub:
      'Each timer counts from the reported incident date. All cases here are fictional.',
    tr_title: 'Case Tracker',
    search: 'Search by title or case ID',
    f_district: 'District',
    f_status: 'Case status',
    f_verif: 'Verification',
    sort: 'Sort by',
    sort_new: 'Newest incident first',
    sort_old: 'Oldest incident first',
    all: 'All',
    loading: 'Loading demo cases…',
    empty_t: 'No cases match your search',
    empty_d: 'Try a different keyword or clear the filters.',
    reset: 'Clear filters',
    showing: (n: string | number, t: string | number) =>
      `Showing ${n} of ${t} demo cases`,
    grid: 'Switch to list view',
    list: 'Switch to grid view',
    details: 'View Case Details',
    source: 'Source: placeholder (none yet)',
    verif: 'Verification',
    location: 'District',
    st_reported: 'Incident reported',
    st_investigation: 'Under investigation',
    st_trial: 'Trial ongoing',
    st_judgment: 'Judgment reported',
    st_appeal: 'Appeal',
    vs_unverified: 'Unverified',
    vs_partial: 'Partially verified (demo)',
    vs_verified: 'Verified (demo)',
    d_dist: {
      dhaka: 'Dhaka Division',
      chattogram: 'Chattogram Division',
      rajshahi: 'Rajshahi Division',
      khulna: 'Khulna Division',
      sylhet: 'Sylhet Division',
      barishal: 'Barishal Division',
      rangpur: 'Rangpur Division',
      mymensingh: 'Mymensingh Division',
    },
    tl_reported: 'Incident reported',
    tl_filed: 'Complaint or case filed',
    tl_investigation: 'Investigation',
    tl_trial: 'Trial started',
    tl_judgment: 'Judgment delivered',
    tl_appeal: 'Appeal',
    case_t: (n: number) => `Demo Case ${String(n).padStart(2, '0')}`,
    m_id: 'Case ID',
    m_inc: 'Incident date',
    m_prec: 'Date precision',
    m_status: 'Status',
    m_filed: 'Filing date',
    m_court: 'Court',
    m_ver: 'Last verification',
    p_day: 'Exact date',
    p_month: 'Approximate (month only)',
    p_unknown: 'Unknown',
    unknown: 'Not available',
    noCourt: 'No court information yet',
    courts: {
      demoCourt1: 'Demo Sessions Court (fictional)',
      demoCourt2: 'Demo Tribunal (fictional)',
      demoCourt3: 'Demo High Court Division (fictional)',
    },
    approx: 'Approximate elapsed time',
    about_n: (y: string | number, m: string | number) =>
      `about ${y ? y + ' yr ' : ''}${m} mo`,
    noTimer:
      'No timer shown: the incident date is not known, so no exact elapsed time is claimed.',
    tl_title: 'Timeline',
    tl_note:
      'Only stages present in the demo record are shown. Not every case reaches every stage.',
    allegation: 'Allegation vs. court finding',
    alleg_a:
      'Descriptions of incidents are allegations. Only a stage marked "Judgment delivered" reflects a court finding, and appeals may change it.',
    filedVsInc:
      'The filing date is different from the incident date; time elapsed is counted from the incident.',
    proto:
      'This website is a frontend prototype. Every case, number and source in it is fictional. It is not an official government or judicial website.',
    about_title: 'About and methodology',
    about: [
      [
        'Why Justice Clock exists',
        'To help people see, calmly and factually, how long it has been since reported incidents, and to encourage transparency about the justice process.',
      ],
      [
        'How elapsed time is calculated',
        'Current time minus the incident date. If only a month is known, we show an approximate figure. If no date is known, we show no timer.',
      ],
      [
        'Incident date vs. filing date',
        'An incident can be reported or filed days, months or years later. The two dates are shown separately. The timer is not proof of court delay.',
      ],
      [
        'How information is verified',
        'Each entry should cite public sources such as court records or reputable reports, with a last-verified date and a verification label.',
      ],
      [
        'Why unverified information is not published',
        'Allegations about real people can cause harm. Unsourced claims would never be listed in a real version.',
      ],
      [
        'Corrections and removal',
        'In a future version, families, lawyers or the public could request corrections or removal. Nothing is submitted anywhere in this prototype.',
      ],
    ] as [string, string][],
    act_title: 'Take action',
    act_sub:
      'Awareness works best when it is accurate and respectful. These demo actions do not send data anywhere.',
    share: 'Share the project',
    learn: 'Learn about the justice process',
    correct: 'Suggest a correction',
    shareMsg:
      'Justice Clock — Bangladesh: a prototype that shows time elapsed since reported incidents. Demo data only.',
    copied: 'Share message copied to clipboard.',
    copyFail: 'Could not copy automatically. Please copy the message manually.',
    process_t: 'The justice process, in outline',
    process: [
      'A complaint or case is filed with the police or a court.',
      'Investigation: evidence is gathered and a report is prepared.',
      'Trial: a court hears both sides.',
      'Judgment: the court delivers its decision.',
      'Appeal: a higher court may review the decision.',
    ],
    process_n:
      'General outline only, not legal advice. Please consult a qualified lawyer.',
    fix_t: 'Suggest a correction',
    fix_l: 'What should be corrected?',
    fix_b: 'Preview submit',
    fix_note: 'Demo only: nothing is sent or stored.',
    fix_ok: 'Thank you. In this prototype your note was not sent anywhere.',
    privacy: 'Privacy',
    disclaimer: 'Disclaimer',
    methodology: 'Methodology',
    language: 'Language',
    privacy_t: 'Privacy',
    privacy_b:
      'This prototype has no backend. It collects, sends and stores no personal data. Real versions must never publish victim names, photos or addresses.',
    disclaimer_t: 'Disclaimer',
    disclaimer_b:
      'Not an official government or judicial website. All cases are fictional and for design preview only. Nothing here is legal advice.',
    foot_mission:
      'A public-awareness prototype about time, transparency and the hope for justice.',
    copy: '© 2026 Justice Clock (prototype)',
    close: 'Close',
    timerLabel: (d: string | number) =>
      `${d} days have passed since the incident`,
    judicial_stats_badge: 'OFFICIAL JUDICIAL DISCLOSURES',
    judicial_stats_title: 'National Judicial Caseload & Clearance Overview',
    judicial_stats_subtitle:
      'Genuine public caseload and performance metrics published by the Supreme Court of Bangladesh and Ministry of Law.',
    tab_national: 'National Overview',
    tab_supreme_court: 'Supreme Court (Drive 2026)',
    tab_subordinate: 'Subordinate Courts (Districts)',
    tab_divisions: 'Divisions & Regional Distribution',
    tab_trends: 'Historical Trends',
    lbl_total_pending: 'Total Pending Cases Nationwide',
    lbl_sc_drive_disposals: 'Cases Disposed (Jan–Aug 2026 Drive)',
    lbl_sc_drive_filings: 'New Cases Filed (Jan–Aug 2026 Drive)',
    lbl_clearance_rate: 'Case Clearance Rate',
    lbl_subordinate_pending: 'Subordinate Courts Backlog',
    lbl_reporting_date: 'Official Reporting Period',
    lbl_data_freshness: 'Data Transparency & Source Freshness',
    lbl_data_freshness_sub:
      'Every figure displayed is mapped to verified public reports from Bangladesh judicial and legislative authorities.',
    lbl_justice_news: 'Verified Judicial & Legal News',
    lbl_justice_news_sub:
      'Live coverage from reputable Bangladeshi newsrooms with original article attribution.',
    btn_refresh_data: 'Check for Updates',
    lbl_last_synced: 'Last verified sync',
    lbl_status_current: 'Current',
    lbl_status_periodic: 'Periodic Official Report',
    lbl_status_delayed: 'Delayed',
    lbl_status_stale: 'Cached / Unreachable',
    lbl_view_source: 'Visit Official Source',
    lbl_disposal_velocity: 'Disposals Outpaced Filings by',
    lbl_cases_count_unit: 'cases',
    lbl_clearance_formula_note:
      'Clearance rate is computed strictly as (Disposals ÷ Filings) × 100 for compatible reporting periods.',
  },
  bn: {
    brand: 'জাস্টিস ক্লক',
    nav_home: 'হোম',
    nav_tracker: 'মামলা ট্র্যাকার',
    nav_about: 'সম্পর্কে',
    nav_action: 'পদক্ষেপ নিন',
    h1: 'বিচারের অপেক্ষা কত দীর্ঘ?',
    sub: 'প্রতিটি ঘটনার পেছনে আছে একজন মানুষ, একটি পরিবার এবং ন্যায়বিচারের প্রত্যাশা।',
    intro:
      'রিপোর্ট করা ঘটনার পর কত সময় পেরিয়েছে, জাস্টিস ক্লক তা দেখায় এবং প্রতিটি মামলার প্রকাশ্যে যাচাইযোগ্য তথ্য এক জায়গায় রাখে। উদ্দেশ্য স্বচ্ছতা ও সচেতনতা।',
    btn_explore: 'মামলাগুলো দেখুন',
    btn_mission: 'আমাদের উদ্দেশ্য',
    clock_label: 'একটি কাল্পনিক ডেমো ঘটনার পর থেকে সময়',
    demo_tag: 'ডেমো',
    clock_note: 'টাইমারে ঘটনার পর থেকে সময় দেখানো হয়, মামলার মেয়াদ নয়।',
    demo_label: 'কাল্পনিক ডেমো তথ্য — বাস্তব মামলা নয়',
    u_d: 'দিন',
    u_h: 'ঘণ্টা',
    u_m: 'মিনিট',
    u_s: 'সেকেন্ড',
    stats_title: 'এক নজরে',
    s1: 'ট্র্যাক করা মামলা',
    s2: 'তদন্তাধীন',
    s3: 'বিচার চলমান',
    s4: 'রায় ঘোষিত',
    stats_note:
      'শুধু নকশা দেখানোর জন্য ডেমো পরিসংখ্যান। সরকারি পরিসংখ্যান নয়।',
    feat_title: 'নির্বাচিত মামলার টাইমার',
    feat_sub:
      'প্রতিটি টাইমার ঘটনার তারিখ থেকে গণনা করে। এখানকার সব মামলা কাল্পনিক।',
    tr_title: 'মামলা ট্র্যাকার',
    search: 'শিরোনাম বা মামলা নম্বর দিয়ে খুঁজুন',
    f_district: 'জেলা/বিভাগ',
    f_status: 'মামলার অবস্থা',
    f_verif: 'যাচাই',
    sort: 'সাজান',
    sort_new: 'নতুন ঘটনা আগে',
    sort_old: 'পুরোনো ঘটনা আগে',
    all: 'সব',
    loading: 'ডেমো মামলা লোড হচ্ছে…',
    empty_t: 'কোনো মামলা মেলেনি',
    empty_d: 'অন্য শব্দ দিয়ে খুঁজুন অথবা ফিল্টার মুছুন।',
    reset: 'ফিল্টার মুছুন',
    showing: (n: string | number, t: string | number) =>
      `${t}টির মধ্যে ${n}টি ডেমো মামলা দেখানো হচ্ছে`,
    grid: 'তালিকা দেখুন',
    list: 'গ্রিড দেখুন',
    details: 'মামলার বিস্তারিত',
    source: 'সূত্র: প্লেসহোল্ডার (এখনো নেই)',
    verif: 'যাচাই',
    location: 'বিভাগ',
    st_reported: 'ঘটনা রিপোর্ট করা হয়েছে',
    st_investigation: 'তদন্তাধীন',
    st_trial: 'বিচার চলমান',
    st_judgment: 'রায় ঘোষিত',
    st_appeal: 'আপিল',
    vs_unverified: 'যাচাই হয়নি',
    vs_partial: 'আংশিক যাচাইকৃত (ডেমো)',
    vs_verified: 'যাচাইকৃত (ডেমো)',
    d_dist: {
      dhaka: 'ঢাকা বিভাগ',
      chattogram: 'চট্টগ্রাম বিভাগ',
      rajshahi: 'রাজশাহী বিভাগ',
      khulna: 'খুলনা বিভাগ',
      sylhet: 'সিলেট বিভাগ',
      barishal: 'বরিশাল বিভাগ',
      rangpur: 'রংপুর বিভাগ',
      mymensingh: 'ময়মনসিংহ বিভাগ',
    },
    tl_reported: 'ঘটনা রিপোর্ট',
    tl_filed: 'অভিযোগ/মামলা দায়ের',
    tl_investigation: 'তদন্ত',
    tl_trial: 'বিচার শুরু',
    tl_judgment: 'রায় ঘোষণা',
    tl_appeal: 'আপিল',
    case_t: (n: number) => `ডেমো কেস ${String(n).padStart(2, '0')}`,
    m_id: 'মামলা নম্বর',
    m_inc: 'ঘটনার তারিখ',
    m_prec: 'তারিখের নির্ভুলতা',
    m_status: 'অবস্থা',
    m_filed: 'দায়েরের তারিখ',
    m_court: 'আদালত',
    m_ver: 'সর্বশেষ যাচাই',
    p_day: 'সঠিক তারিখ',
    p_month: 'আনুমানিক (শুধু মাস)',
    p_unknown: 'অজানা',
    unknown: 'পাওয়া যায়নি',
    noCourt: 'আদালতের তথ্য এখনো নেই',
    courts: {
      demoCourt1: 'ডেমো দায়রা আদালত (কাল্পনিক)',
      demoCourt2: 'ডেমো ট্রাইব্যুনাল (কাল্পনিক)',
      demoCourt3: 'ডেমো হাইকোর্ট বিভাগ (কাল্পনিক)',
    },
    approx: 'আনুমানিক অতিবাহিত সময়',
    about_n: (y: string | number, m: string | number) =>
      `প্রায় ${y ? y + ' বছর ' : ''}${m} মাস`,
    noTimer:
      'টাইমার দেখানো হয়নি: ঘটনার তারিখ জানা নেই, তাই সঠিক সময় দাবি করা হচ্ছে না।',
    tl_title: 'সময়রেখা',
    tl_note:
      'ডেমো তথ্যে থাকা ধাপগুলোই শুধু দেখানো হয়েছে। সব মামলা সব ধাপে পৌঁছায় না।',
    allegation: 'অভিযোগ বনাম আদালতের সিদ্ধান্ত',
    alleg_a:
      'ঘটনার বিবরণ অভিযোগ মাত্র। শুধু "রায় ঘোষণা" চিহ্নিত ধাপ আদালতের সিদ্ধান্ত বোঝায়, আর আপিলে তা বদলাতে পারে।',
    filedVsInc:
      'দায়েরের তারিখ ঘটনার তারিখ থেকে আলাদা; সময় ঘটনার দিন থেকে গোনা হয়।',
    proto:
      'এই ওয়েবসাইট একটি ফ্রন্টএন্ড প্রোটোটাইপ। এখানকার সব মামলা, সংখ্যা ও সূত্র কাল্পনিক। এটি সরকারি বা বিচার বিভাগীয় ওয়েবসাইট নয়।',
    about_title: 'সম্পর্কে ও পদ্ধতি',
    about: [
      [
        'জাস্টিস ক্লক কেন',
        'রিপোর্ট করা ঘটনার পর কত সময় পেরিয়েছে তা শান্ত ও তথ্যভিত্তিকভাবে দেখাতে এবং বিচার প্রক্রিয়ায় স্বচ্ছতা বাড়াতে।',
      ],
      [
        'অতিবাহিত সময় কীভাবে গোনা হয়',
        'বর্তমান সময় থেকে ঘটনার তারিখ বিয়োগ। শুধু মাস জানা থাকলে আনুমানিক হিসাব দেখানো হয়। তারিখ না জানলে কোনো টাইমার নেই।',
      ],
      [
        'ঘটনার তারিখ ও মামলা দায়েরের তারিখ',
        'ঘটনার কয়েক দিন, মাস বা বছর পরেও অভিযোগ হতে পারে। দুটি তারিখ আলাদা দেখানো হয়। টাইমার আদালতের দেরির প্রমাণ নয়।',
      ],
      [
        'তথ্য কীভাবে যাচাই হবে',
        'প্রতিটি তথ্যে আদালতের নথি বা নির্ভরযোগ্য প্রতিবেদনের মতো প্রকাশ্য সূত্র, সর্বশেষ যাচাইয়ের তারিখ ও যাচাই-লেবেল থাকা উচিত।',
      ],
      [
        'যাচাই না হওয়া তথ্য কেন প্রকাশ নয়',
        'বাস্তব মানুষের বিরুদ্ধে অভিযোগ ক্ষতি করতে পারে। সূত্রহীন দাবি বাস্তব সংস্করণে কখনো থাকবে না।',
      ],
      [
        'সংশোধন ও অপসারণ',
        'ভবিষ্যতে পরিবার, আইনজীবী বা জনগণ সংশোধন বা অপসারণের অনুরোধ করতে পারবে। এই প্রোটোটাইপে কোথাও কিছু জমা হয় না।',
      ],
    ] as [string, string][],
    act_title: 'পদক্ষেপ নিন',
    act_sub:
      'সচেতনতা তখনই কার্যকর, যখন তা নির্ভুল ও সম্মানজনক। এই ডেমো কাজগুলো কোথাও তথ্য পাঠায় না।',
    share: 'প্রকল্প শেয়ার করুন',
    learn: 'বিচার প্রক্রিয়া জানুন',
    correct: 'সংশোধনের পরামর্শ দিন',
    shareMsg:
      'জাস্টিস ক্লক — বাংলাদেশ: রিপোর্ট করা ঘটনার পর কত সময় পেরিয়েছে তা দেখানো একটি প্রোটোটাইপ। শুধু ডেমো তথ্য।',
    copied: 'শেয়ার বার্তা কপি হয়েছে।',
    copyFail: 'নিজে থেকে কপি করা যায়নি। বার্তাটি হাতে কপি করুন।',
    process_t: 'বিচার প্রক্রিয়ার সংক্ষিপ্ত রূপরেখা',
    process: [
      'থানায় বা আদালতে অভিযোগ/মামলা দায়ের।',
      'তদন্ত: সাক্ষ্যপ্রমাণ সংগ্রহ ও প্রতিবেদন তৈরি।',
      'বিচার: আদালত উভয় পক্ষের বক্তব্য শোনে।',
      'রায়: আদালত সিদ্ধান্ত দেয়।',
      'আপিল: উচ্চতর আদালত সিদ্ধান্ত পর্যালোচনা করতে পারে।',
    ],
    process_n:
      'এটি সাধারণ রূপরেখা, আইনি পরামর্শ নয়। যোগ্য আইনজীবীর সঙ্গে কথা বলুন।',
    fix_t: 'সংশোধনের পরামর্শ',
    fix_l: 'কী সংশোধন করা উচিত?',
    fix_b: 'জমার প্রিভিউ',
    fix_note: 'শুধু ডেমো: কিছু পাঠানো বা সংরক্ষণ হয় না।',
    fix_ok: 'ধন্যবাদ। এই প্রোটোটাইপে আপনার নোট কোথাও পাঠানো হয়নি।',
    privacy: 'গোপনীয়তা',
    disclaimer: 'দাবিত্যাগ',
    methodology: 'পদ্ধতি',
    language: 'ভাষা',
    privacy_t: 'গোপনীয়তা',
    privacy_b:
      'এই প্রোটোটাইপে কোনো ব্যাকএন্ড নেই। কোনো ব্যক্তিগত তথ্য সংগ্রহ, প্রেরণ বা সংরক্ষণ করা হয় না। বাস্তব সংস্করণে ভুক্তভোগীর নাম, ছবি বা ঠিকানা কখনো প্রকাশ করা যাবে না।',
    disclaimer_t: 'দাবিত্যাগ',
    disclaimer_b:
      'এটি সরকারি বা বিচার বিভাগীয় ওয়েবসাইট নয়। সব মামলা কাল্পনিক এবং শুধু নকশা দেখানোর জন্য। এখানে কিছুই আইনি পরামর্শ নয়।',
    foot_mission:
      'সময়, স্বচ্ছতা ও ন্যায়বিচারের প্রত্যাশা নিয়ে একটি জনসচেতনতামূলক প্রোটোটাইপ।',
    copy: '© ২০২৬ জাস্টিস ক্লক (প্রোটোটাইপ)',
    close: 'বন্ধ করুন',
    timerLabel: (d: string | number) => `ঘটনার পর ${d} দিন পেরিয়েছে`,
    judicial_stats_badge: 'সরকারি বিচারিক পরিসংখ্যান',
    judicial_stats_title: 'জাতীয় মামলার জট ও নিষ্পত্তি পরিসংখ্যান',
    judicial_stats_subtitle:
      'বাংলাদেশ সুপ্রীম কোর্ট এবং আইন, বিচার ও সংসদ বিষয়ক মন্ত্রণালয় কর্তৃক সংসদে উপস্থাপিত ও প্রকাশিত আনুষ্ঠানিক তথ্য।',
    tab_national: 'জাতীয় সামগ্রিক চিত্র',
    tab_supreme_court: 'সুপ্রীম কোর্ট (২০২৬ ড্রাইভ)',
    tab_subordinate: 'অধস্তন ও জেলা আদালত',
    tab_divisions: 'বিভাগীয় ও আঞ্চলিক চিত্র',
    tab_trends: 'ঐতিহাসিক গতিপ্রকৃতি',
    lbl_total_pending: 'সারাদেশে মোট অনিষ্পন্ন মামলা',
    lbl_sc_drive_disposals: 'নিষ্পত্তিকৃত মামলা (জানুয়ারি–আগস্ট ২০২৬)',
    lbl_sc_drive_filings: 'নতুন দায়েরকৃত মামলা (জানুয়ারি–আগস্ট ২০২৬)',
    lbl_clearance_rate: 'মামলা নিষ্পত্তি হার (ক্লিয়ারেন্স রেট)',
    lbl_subordinate_pending: 'অধস্তন আদালতের মামলা জট',
    lbl_reporting_date: 'আনুষ্ঠানিক প্রতিবেদনের সময়কাল',
    lbl_data_freshness: 'তথ্যের স্বচ্ছতা ও সর্বশেষ অবস্থা',
    lbl_data_freshness_sub:
      'এখানে প্রদর্শিত প্রতিটি পরিসংখ্যান বাংলাদেশ সুপ্রীম কোর্ট এবং আইন মন্ত্রণালয়ের যাচাইকৃত উন্মুক্ত প্রকাশনার সাথে সরাসরি সংযুক্ত।',
    lbl_justice_news: 'যাচাইকৃত আইনি ও বিচার বিভাগীয় সংবাদ',
    lbl_justice_news_sub:
      'শীর্ষস্থানীয় জাতীয় গণমাধ্যম (দ্য ডেইলি স্টার, প্রথম আলো, ঢাকা ট্রিবিউন) থেকে সরাসরি সংবাদ লিংক ও তথ্যসূত্র।',
    btn_refresh_data: 'হালনাগাদ যাচাই করুন',
    lbl_last_synced: 'সর্বশেষ যাচাইকৃত সিঙ্ক',
    lbl_status_current: 'হালনাগাদ',
    lbl_status_periodic: 'পর্যায়ক্রমিক সরকারি রিপোর্ট',
    lbl_status_delayed: 'বিলম্বিত',
    lbl_status_stale: 'ক্যাশকৃত (উৎস সাময়িক অনুপলব্ধ)',
    lbl_view_source: 'সরকারি পোর্টালে যান',
    lbl_disposal_velocity: 'নতুন মামলার চেয়ে বেশি নিষ্পত্তি হয়েছে',
    lbl_cases_count_unit: 'টি মামলা',
    lbl_clearance_formula_note:
      'ক্লিয়ারেন্স রেট কঠোরভাবে সামঞ্জস্যপূর্ণ প্রতিবেদনের সময়কালের জন্য (নিষ্পত্তি ÷ ফাইলিং) × ১০০ হিসেবে গণনা করা হয়।',
  },
};

export const toBnNum = (n: number | string): string => {
  return String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
};

export const formatNumber = (n: number | string, lang: Language): string => {
  return lang === 'bn' ? toBnNum(n) : String(n);
};

export const formatDate = (
  iso: string | null,
  lang: Language,
  unknownFallback: string
): string => {
  if (!iso) return unknownFallback;
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return unknownFallback;
  }
};

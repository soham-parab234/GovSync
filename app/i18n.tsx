'use client';
import {authTranslations} from './auth-translations';
import {createContext,useContext,useEffect,useState} from 'react';
export type Language='en'|'hi'|'mr';
export const translations:Record<string,[string,string]>={
 ...authTranslations,
"Select a submitted application":["जमा किया गया आवेदन चुनें","सादर केलेला अर्ज निवडा"],
"No submitted applications yet":["अभी कोई आवेदन जमा नहीं हुआ है","अद्याप कोणताही अर्ज सादर केलेला नाही"],
"Saved verification records from submitted applications. No new department request is made.":["जमा किए गए आवेदनों के सहेजे गए सत्यापन रिकॉर्ड। विभाग को नया अनुरोध नहीं भेजा जाता।","सादर केलेल्या अर्जांच्या जतन केलेल्या पडताळणी नोंदी. विभागाला नवीन विनंती पाठवली जात नाही."],
"Submit a verified citizen application first, then return here. Draft applications are private to the citizen.":["पहले सत्यापित नागरिक आवेदन जमा करें, फिर यहाँ आएँ। मसौदा आवेदन केवल नागरिक को दिखते हैं।","प्रथम पडताळलेला नागरिक अर्ज सादर करा, मग येथे या. मसुदा अर्ज फक्त नागरिकाला दिसतात."],
"Loading saved records…":["सहेजे गए रिकॉर्ड लोड हो रहे हैं…","जतन केलेल्या नोंदी लोड होत आहेत…"],
"No saved verification records for this application.":["इस आवेदन के लिए कोई सत्यापन रिकॉर्ड नहीं है।","या अर्जासाठी जतन केलेल्या पडताळणी नोंदी नाहीत."],
"Verified at":["सत्यापन का समय","पडताळणीची वेळ"],
"Field-by-field comparison":["प्रत्येक फ़ील्ड की तुलना","प्रत्येक फील्डची तुलना"],
"Department field":["विभाग का फ़ील्ड","विभागाचे फील्ड"],
"Original value":["मूल मान","मूळ मूल्य"],
"GovSync field":["GovSync फ़ील्ड","GovSync फील्ड"],
"Standardized value":["मानकीकृत मान","प्रमाणित मूल्य"],
"Only administrators can view submitted application mappings.":["केवल प्रशासक जमा किए गए आवेदनों की मैपिंग देख सकते हैं।","फक्त प्रशासक सादर केलेल्या अर्जांचे मॅपिंग पाहू शकतात."],
"Submitted application not found.":["जमा किया गया आवेदन नहीं मिला।","सादर केलेला अर्ज सापडला नाही."],
 "Help": ["सहायता", "मदत"],
 "Citizen services prototype": ["नागरिक सेवाओं का प्रोटोटाइप", "नागरिक सेवांचा प्रोटोटाइप"],
 "Skip to main content": ["मुख्य सामग्री पर जाएँ", "मुख्य मजकुराकडे जा"],
 "Text size": ["अक्षरों का आकार", "अक्षरांचा आकार"],
 "Decrease text size": ["अक्षरों का आकार घटाएँ", "अक्षरांचा आकार कमी करा"],
 "Reset text size": ["अक्षरों का सामान्य आकार करें", "अक्षरांचा मूळ आकार करा"],
 "Increase text size": ["अक्षरों का आकार बढ़ाएँ", "अक्षरांचा आकार वाढवा"],
 "Home": ["मुख्य पृष्ठ", "मुखपृष्ठ"],
 "Main navigation": ["मुख्य नेविगेशन", "मुख्य नेव्हिगेशन"],
 "Citizen login": ["नागरिक लॉगिन", "नागरिक लॉगिन"],
 "My workspace": ["मेरा कार्यक्षेत्र", "माझे कार्यक्षेत्र"],
 "Search services": ["सेवाएँ खोजें", "सेवा शोधा"],
 "Search services, certificates, schemes...": ["सेवाएँ, प्रमाणपत्र, योजनाएँ खोजें...", "सेवा, प्रमाणपत्रे, योजना शोधा..."],
 "Search": ["खोजें", "शोधा"],
 "Quick access": ["त्वरित पहुँच", "झटपट प्रवेश"],
 "Scholarships": ["छात्रवृत्तियाँ", "शिष्यवृत्ती"],
 "Certificates": ["प्रमाणपत्र", "प्रमाणपत्रे"],
 "Track application": ["आवेदन की स्थिति देखें", "अर्जाची स्थिती पाहा"],
 "4 connected sources": ["४ जुड़े स्रोत", "४ जोडलेले स्रोत"],
 "3 connected sources": ["३ जुड़े स्रोत", "३ जोडलेले स्रोत"],
 "Connected citizen services": ["जुड़ी हुई नागरिक सेवाएँ", "जोडलेल्या नागरिक सेवा"],
 "One place for the services that matter.": ["आपकी ज़रूरी सेवाएँ, एक ही जगह।", "तुमच्या गरजेच्या सेवा, एकाच ठिकाणी."],
 "Apply with verified information and follow your application at every step.": ["सत्यापित जानकारी से आवेदन करें और हर चरण में उसकी स्थिति देखें।", "पडताळलेल्या माहितीसह अर्ज करा आणि प्रत्येक टप्प्यावर त्याची स्थिती पाहा."],
 "Explore services": ["सेवाएँ देखें", "सेवा पाहा"],
 "Track an application": ["आवेदन की स्थिति देखें", "अर्जाची स्थिती पाहा"],
 "Apply online": ["ऑनलाइन आवेदन करें", "ऑनलाइन अर्ज करा"],
 "Search results": ["खोज परिणाम", "शोध परिणाम"],
 "Available services": ["उपलब्ध सेवाएँ", "उपलब्ध सेवा"],
 "{count} services available": ["{count} सेवाएँ उपलब्ध", "{count} सेवा उपलब्ध"],
 "Results for": ["इसके लिए परिणाम", "यासाठी परिणाम"],
 "Clear search": ["खोज साफ़ करें", "शोध साफ करा"],
 "No services found": ["कोई सेवा नहीं मिली", "कोणतीही सेवा सापडली नाही"],
 "Try scholarship, residence or certificate.": ["छात्रवृत्ति, निवास या प्रमाणपत्र खोजें।", "शिष्यवृत्ती, रहिवास किंवा प्रमाणपत्र शोधा."],
 "Show all services": ["सभी सेवाएँ दिखाएँ", "सर्व सेवा दाखवा"],
 "How to apply": ["आवेदन कैसे करें", "अर्ज कसा करावा"],
 "Choose your service": ["अपनी सेवा चुनें", "तुमची सेवा निवडा"],
 "Select Scholarship or Residence and choose a sample applicant.": ["छात्रवृत्ति या निवास सेवा चुनें और एक नमूना आवेदक चुनें।", "शिष्यवृत्ती किंवा रहिवास सेवा निवडा आणि एक नमुना अर्जदार निवडा."],
 "Review and give permission": ["समीक्षा करें और अनुमति दें", "पुनरावलोकन करा आणि परवानगी द्या"],
 "Choose the required sources and review the information before submission.": ["आवश्यक स्रोत चुनें और जमा करने से पहले जानकारी की समीक्षा करें।", "आवश्यक स्रोत निवडा आणि अर्ज सादर करण्यापूर्वी माहितीचे पुनरावलोकन करा."],
 "Follow your application": ["अपने आवेदन की स्थिति देखें", "तुमच्या अर्जाची स्थिती पाहा"],
 "Open My applications to view decisions, respond to clarification or download an approved demo certificate.": ["निर्णय देखने, स्पष्टीकरण का जवाब देने या स्वीकृत डेमो प्रमाणपत्र डाउनलोड करने के लिए मेरे आवेदन खोलें।", "निर्णय पाहण्यासाठी, स्पष्टीकरणाला उत्तर देण्यासाठी किंवा मंजूर नमुना प्रमाणपत्र डाउनलोड करण्यासाठी माझे अर्ज उघडा."],
 "About this prototype": ["इस प्रोटोटाइप के बारे में", "या प्रोटोटाइपबद्दल"],
 "GovSync demonstrates consent-based information sharing between sample departments.": ["समन्वय नमूना विभागों के बीच सहमति के आधार पर जानकारी साझा करने का प्रदर्शन करता है।", "समन्वय नमुना विभागांमध्ये संमतीच्या आधारे माहिती सामायिक करण्याचे प्रात्यक्षिक दाखवतो."],
 "It uses fictional records and does not issue government documents or send email or SMS.": ["यह काल्पनिक रिकॉर्ड का उपयोग करता है। यह सरकारी दस्तावेज़ जारी नहीं करता और ईमेल या एसएमएस नहीं भेजता।", "यात काल्पनिक नोंदी वापरल्या आहेत. हे सरकारी कागदपत्रे जारी करत नाही आणि ईमेल किंवा एसएमएस पाठवत नाही."],
 "Your saved applications, permissions and activity are available in this workspace.": ["आपके सहेजे गए आवेदन, अनुमतियाँ और गतिविधियाँ इस कार्यक्षेत्र में उपलब्ध हैं।", "तुमचे जतन केलेले अर्ज, परवानग्या आणि हालचाली या कार्यक्षेत्रात उपलब्ध आहेत."],
 "Help and about": ["सहायता और परिचय", "मदत आणि परिचय"],
 "Person using a laptop at a desk in a bright home workspace.": ["घर के रोशनी वाले कार्यक्षेत्र में मेज़ पर लैपटॉप का उपयोग करता हुआ व्यक्ति।", "घरातील उजेड असलेल्या कार्यक्षेत्रात टेबलावर लॅपटॉप वापरणारी व्यक्ती."],
 "Prototype environment": ["प्रोटोटाइप परिवेश", "प्रोटोटाइप वातावरण"],
 "Sample records only. No live government integration.": ["केवल नमूना रिकॉर्ड। वास्तविक सरकारी प्रणालियों से जुड़ा नहीं।", "फक्त नमुना नोंदी. प्रत्यक्ष सरकारी प्रणालीशी जोडलेले नाही."],
 "Loading your workspace": ["आपका कार्यक्षेत्र लोड हो रहा है", "तुमचे कार्यक्षेत्र लोड होत आहे"],
 "Services": [
  "सेवाएँ",
  "सेवा"
 ],
 "My applications": [
  "मेरे आवेदन",
  "माझे अर्ज"
 ],
 "Permissions": [
  "अनुमतियाँ",
  "परवानग्या"
 ],
 "Activity": [
  "गतिविधि",
  "हालचाली"
 ],
 "Overview": [
  "अवलोकन",
  "आढावा"
 ],
 "API monitor": [
  "API निगरानी",
  "API निरीक्षण"
 ],
 "Data mappings": [
  "डेटा मैपिंग",
  "डेटा मॅपिंग"
 ],
 "Developer guide": [
  "डेवलपर मार्गदर्शिका",
  "विकासक मार्गदर्शक"
 ],
 "Citizen portal": [
  "नागरिक पोर्टल",
  "नागरिक पोर्टल"
 ],
 "Administration": [
  "प्रशासन",
  "प्रशासन"
 ],
 "Connected governance": [
  "जुड़ा हुआ प्रशासन",
  "जोडलेले प्रशासन"
 ],
 "Your services, simplified.": [
  "आपकी सेवाएँ, अब आसान।",
  "तुमच्या सेवा, आता सोप्या."
 ],
 "Choose a service and apply using verified information.": [
  "सेवा चुनें और सत्यापित जानकारी से आवेदन करें।",
  "सेवा निवडा आणि पडताळलेल्या माहितीसह अर्ज करा."
 ],
 "Administration dashboard": [
  "प्रशासन डैशबोर्ड",
  "प्रशासनाचा आढावा"
 ],
 "Prototype environment · sample records only · no live government integration.": [
  "प्रोटोटाइप · केवल नमूना रिकॉर्ड · वास्तविक सरकारी प्रणालियों से जुड़ा नहीं।",
  "प्रोटोटाइप · फक्त नमुना नोंदी · प्रत्यक्ष सरकारी प्रणालीशी जोडलेले नाही."
 ],
 "Sign in to workspace": [
  "कार्यक्षेत्र में साइन इन करें",
  "कार्यक्षेत्रात साइन इन करा"
 ],
 "Sign in to save your applications.": [
  "आवेदन सहेजने के लिए साइन इन करें।",
  "अर्ज जतन करण्यासाठी साइन इन करा."
 ],
 "Refresh": [
  "रिफ्रेश करें",
  "पुन्हा लोड करा"
 ],
 "Start a new application": [
  "नया आवेदन शुरू करें",
  "नवीन अर्ज सुरू करा"
 ],
 "Scholarship Application": [
  "छात्रवृत्ति आवेदन",
  "शिष्यवृत्ती अर्ज"
 ],
 "Residence / Domicile Certificate": [
  "निवास / अधिवास प्रमाणपत्र",
  "रहिवास / अधिवास प्रमाणपत्र"
 ],
 "Merit & Access Scholarship": [
  "योग्यता और अवसर छात्रवृत्ति",
  "गुणवत्ता आणि संधी शिष्यवृत्ती"
 ],
 "Identity, education, income and residence verification.": [
  "पहचान, शिक्षा, आय और निवास का सत्यापन।",
  "ओळख, शिक्षण, उत्पन्न आणि रहिवासाची पडताळणी."
 ],
 "Apply using your verified identity and residence information.": [
  "अपनी सत्यापित पहचान और निवास जानकारी से आवेदन करें।",
  "पडताळलेली ओळख आणि रहिवासाच्या माहितीसह अर्ज करा."
 ],
 "Start Application": [
  "आवेदन शुरू करें",
  "अर्ज सुरू करा"
 ],
 "Change service": [
  "सेवा बदलें",
  "सेवा बदला"
 ],
 "New application": [
  "नया आवेदन",
  "नवीन अर्ज"
 ],
 "Consent": [
  "सहमति",
  "संमती"
 ],
 "Verify records": [
  "रिकॉर्ड सत्यापित करें",
  "नोंदी पडताळा"
 ],
 "Application": [
  "आवेदन",
  "अर्ज"
 ],
 "Review": [
  "समीक्षा",
  "पुनरावलोकन"
 ],
 "Track": [
  "स्थिति देखें",
  "स्थिती पाहा"
 ],
 "Choose a sample applicant": [
  "नमूना आवेदक चुनें",
  "नमुना अर्जदार निवडा"
 ],
 "Demo citizen": [
  "डेमो नागरिक",
  "नमुना नागरिक"
 ],
 "Asha Sharma": [
  "आशा शर्मा",
  "आशा शर्मा"
 ],
 "Rohan Patil": [
  "रोहन पाटिल",
  "रोहन पाटील"
 ],
 "Meera Joshi": [
  "मीरा जोशी",
  "मीरा जोशी"
 ],
 "Information required for this application": [
  "इस आवेदन के लिए आवश्यक जानकारी",
  "या अर्जासाठी आवश्यक माहिती"
 ],
 "Source": [
  "स्रोत",
  "स्रोत"
 ],
 "Information": [
  "जानकारी",
  "माहिती"
 ],
 "Purpose": [
  "उद्देश्य",
  "उद्देश"
 ],
 "Identity": [
  "पहचान",
  "ओळख"
 ],
 "Education": [
  "शिक्षा",
  "शिक्षण"
 ],
 "Income": [
  "आय",
  "उत्पन्न"
 ],
 "Residence": [
  "निवास",
  "रहिवास"
 ],
 "Documents": [
  "दस्तावेज़",
  "कागदपत्रे"
 ],
 "Name and date of birth": [
  "नाम और जन्मतिथि",
  "नाव आणि जन्मतारीख"
 ],
 "College, course and academic score": [
  "कॉलेज, पाठ्यक्रम और अंक",
  "महाविद्यालय, अभ्यासक्रम आणि गुण"
 ],
 "Annual family income": [
  "वार्षिक पारिवारिक आय",
  "वार्षिक कौटुंबिक उत्पन्न"
 ],
 "Address, district, state, PIN and domicile": [
  "पता, जिला, राज्य, पिन और अधिवास",
  "पत्ता, जिल्हा, राज्य, पिन आणि अधिवास"
 ],
 "Existing verified address proof": [
  "पहले से सत्यापित पते का प्रमाण",
  "आधीच पडताळलेला पत्त्याचा पुरावा"
 ],
 "Applicant verification": [
  "आवेदक सत्यापन",
  "अर्जदार पडताळणी"
 ],
 "Eligibility": [
  "पात्रता",
  "पात्रता"
 ],
 "Residence verification": [
  "निवास सत्यापन",
  "रहिवास पडताळणी"
 ],
 "Supporting evidence": [
  "सहायक प्रमाण",
  "सहायक पुरावा"
 ],
 "Permission expires after {hours} hours and can be revoked.": [
  "अनुमति {hours} घंटे बाद समाप्त होती है और वापस ली जा सकती है।",
  "परवानगी {hours} तासांनी संपते आणि मागे घेता येते."
 ],
 "I consent to retrieving the selected information from connected systems.": [
  "मैं जुड़ी प्रणालियों से चयनित जानकारी प्राप्त करने की सहमति देता/देती हूँ।",
  "जोडलेल्या प्रणालींमधून निवडलेली माहिती मिळवण्यास मी संमती देतो/देते."
 ],
 "Grant Consent": [
  "सहमति दें",
  "संमती द्या"
 ],
 "{count} of {total} sources selected": [
  "{total} में से {count} स्रोत चुने गए",
  "{total} पैकी {count} स्रोत निवडले"
 ],
 "Demonstrate an address mismatch": [
  "पते का अंतर दिखाएँ",
  "पत्त्यातील फरक दाखवा"
 ],
 "Simulate a department outage": [
  "विभाग अनुपलब्ध होने का डेमो",
  "विभाग अनुपलब्ध असल्याचा डेमो"
 ],
 "Retrieving verified information…": [
  "सत्यापित जानकारी प्राप्त की जा रही है…",
  "पडताळलेली माहिती मिळवत आहे…"
 ],
 "Preparing application": [
  "आवेदन तैयार हो रहा है",
  "अर्ज तयार होत आहे"
 ],
 "Verified": [
  "सत्यापित",
  "पडताळलेले"
 ],
 "Waiting": [
  "प्रतीक्षारत",
  "प्रतीक्षेत"
 ],
 "Unavailable": [
  "अनुपलब्ध",
  "अनुपलब्ध"
 ],
 "Retry verification": [
  "फिर से सत्यापन करें",
  "पुन्हा पडताळणी करा"
 ],
 "Verification pending": [
  "सत्यापन बाकी है",
  "पडताळणी बाकी"
 ],
 "Eligible to apply": [
  "आवेदन के लिए पात्र",
  "अर्जासाठी पात्र"
 ],
 "Ready for submission": [
  "जमा करने के लिए तैयार",
  "सादर करण्यास तयार"
 ],
 "Not eligible": [
  "पात्र नहीं",
  "अपात्र"
 ],
 "Needs review": [
  "समीक्षा आवश्यक",
  "पुनरावलोकन आवश्यक"
 ],
 "Department Review": [
  "विभागीय समीक्षा",
  "विभागीय पुनरावलोकन"
 ],
 "Certificate Approved": [
  "प्रमाणपत्र स्वीकृत",
  "प्रमाणपत्र मंजूर"
 ],
 "Clarification requested": [
  "स्पष्टीकरण माँगा गया",
  "स्पष्टीकरण मागवले"
 ],
 "Rejected": [
  "अस्वीकृत",
  "नाकारले"
 ],
 "Submitted for review": [
  "समीक्षा के लिए जमा",
  "पुनरावलोकनासाठी सादर"
 ],
 "Success": [
  "सफल",
  "यशस्वी"
 ],
 "Failed": [
  "असफल",
  "अयशस्वी"
 ],
 "Blocked": [
  "अवरुद्ध",
  "अवरोधित"
 ],
 "Residence Certificate Application": [
  "निवास प्रमाणपत्र आवेदन",
  "रहिवास प्रमाणपत्र अर्ज"
 ],
 "Scholarship application form": [
  "छात्रवृत्ति आवेदन फॉर्म",
  "शिष्यवृत्ती अर्ज"
 ],
 "{count} fields populated from connected records": [
  "जुड़े रिकॉर्ड से {count} फ़ील्ड भरे गए",
  "जोडलेल्या नोंदींमधून {count} रकाने भरले"
 ],
 "Full name": [
  "पूरा नाम",
  "पूर्ण नाव"
 ],
 "Date of birth": [
  "जन्मतिथि",
  "जन्मतारीख"
 ],
 "Address": [
  "पता",
  "पत्ता"
 ],
 "District": [
  "जिला",
  "जिल्हा"
 ],
 "State": [
  "राज्य",
  "राज्य"
 ],
 "PIN Code": [
  "पिन कोड",
  "पिन कोड"
 ],
 "College": [
  "कॉलेज",
  "महाविद्यालय"
 ],
 "Course": [
  "पाठ्यक्रम",
  "अभ्यासक्रम"
 ],
 "Academic score (%)": [
  "शैक्षणिक अंक (%)",
  "शैक्षणिक गुण (%)"
 ],
 "Domicile": [
  "अधिवास",
  "अधिवास"
 ],
 "Residence Since": [
  "निवास शुरू होने का वर्ष",
  "वास्तव्याचे सुरुवातीचे वर्ष"
 ],
 "Supporting Document": [
  "सहायक दस्तावेज़",
  "सहायक कागदपत्र"
 ],
 "Verified address proof": [
  "सत्यापित पते का प्रमाण",
  "पडताळलेला पत्त्याचा पुरावा"
 ],
 "Employment": [
  "रोजगार",
  "रोजगार"
 ],
 "Government service": [
  "सरकारी सेवा",
  "सरकारी सेवा"
 ],
 "Maharashtra": [
  "महाराष्ट्र",
  "महाराष्ट्र"
 ],
 "Mumbai Suburban": [
  "मुंबई उपनगर",
  "मुंबई उपनगर"
 ],
 "Flat 12, Andheri East": [
  "फ्लैट १२, अंधेरी पूर्व",
  "सदनिका १२, अंधेरी पूर्व"
 ],
 "Flat No. 12, Andheri": [
  "फ्लैट नं. १२, अंधेरी",
  "सदनिका क्र. १२, अंधेरी"
 ],
 "Demo Institute of Technology": [
  "डेमो प्रौद्योगिकी संस्थान",
  "नमुना तंत्रज्ञान संस्था"
 ],
 "B.Tech · Computer Science": [
  "बी.टेक · कंप्यूटर विज्ञान",
  "बी.टेक · संगणकशास्त्र"
 ],
 "Address mismatch detected": [
  "पते में अंतर मिला",
  "पत्त्यात फरक आढळला"
 ],
 "Residence Registry": [
  "निवास रजिस्ट्री",
  "रहिवास नोंदणी"
 ],
 "Minor formatting difference detected. Accept the registry address or edit and validate again.": [
  "पते के प्रारूप में छोटा अंतर मिला। रजिस्ट्री का पता स्वीकारें या सुधारकर फिर सत्यापित करें।",
  "पत्त्याच्या स्वरूपात थोडा फरक आहे. नोंदणीतील पत्ता स्वीकारा किंवा बदलून पुन्हा पडताळा."
 ],
 "Accept verified address": [
  "सत्यापित पता स्वीकारें",
  "पडताळलेला पत्ता स्वीकारा"
 ],
 "Edit information": [
  "जानकारी बदलें",
  "माहिती बदला"
 ],
 "Data normalized successfully": [
  "डेटा सफलतापूर्वक मानकीकृत",
  "माहिती यशस्वीपणे प्रमाणित स्वरूपात आणली"
 ],
 "Validate information": [
  "जानकारी सत्यापित करें",
  "माहिती पडताळा"
 ],
 "Verification Check": [
  "सत्यापन जाँच",
  "पडताळणी तपासणी"
 ],
 "Name matches identity record": [
  "नाम पहचान रिकॉर्ड से मेल खाता है",
  "नाव ओळख नोंदीशी जुळते"
 ],
 "Address matches residence registry": [
  "पता निवास रजिस्ट्री से मेल खाता है",
  "पत्ता रहिवास नोंदणीशी जुळतो"
 ],
 "Address format valid": [
  "पते का प्रारूप सही है",
  "पत्त्याचे स्वरूप योग्य आहे"
 ],
 "District matches PIN": [
  "जिला पिन से मेल खाता है",
  "जिल्हा पिनशी जुळतो"
 ],
 "Verified Maharashtra domicile": [
  "सत्यापित महाराष्ट्र अधिवास",
  "पडताळलेला महाराष्ट्र अधिवास"
 ],
 "Verified supporting document": [
  "सहायक दस्तावेज़ सत्यापित",
  "सहायक कागदपत्र पडताळले"
 ],
 "Residence history matches registry": [
  "निवास इतिहास रजिस्ट्री से मेल खाता है",
  "वास्तव्याचा इतिहास नोंदणीशी जुळतो"
 ],
 "Required fields complete": [
  "आवश्यक फ़ील्ड पूर्ण हैं",
  "आवश्यक रकाने पूर्ण आहेत"
 ],
 "Identity matches academic record": [
  "पहचान शैक्षणिक रिकॉर्ड से मेल खाती है",
  "ओळख शैक्षणिक नोंदीशी जुळते"
 ],
 "Academic score at least 75%": [
  "शैक्षणिक अंक कम से कम ७५%",
  "शैक्षणिक गुण किमान ७५%"
 ],
 "Annual family income at most ₹2,50,000": [
  "वार्षिक पारिवारिक आय अधिकतम ₹२,५०,०००",
  "वार्षिक कौटुंबिक उत्पन्न कमाल ₹२,५०,०००"
 ],
 "Resolve the failed checks before submission.": [
  "जमा करने से पहले असफल जाँचों को ठीक करें।",
  "सादर करण्यापूर्वी अयशस्वी तपासण्या दुरुस्त करा."
 ],
 "Review before submission": [
  "जमा करने से पहले समीक्षा करें",
  "सादर करण्यापूर्वी पुनरावलोकन करा"
 ],
 "Continue to review": [
  "समीक्षा जारी रखें",
  "पुनरावलोकनाकडे जा"
 ],
 "Back to application": [
  "आवेदन पर वापस जाएँ",
  "अर्जाकडे परत जा"
 ],
 "I confirm that the information shown is correct.": [
  "मैं पुष्टि करता/करती हूँ कि दिखाई गई जानकारी सही है।",
  "दाखवलेली माहिती योग्य असल्याची मी पुष्टी करतो/करते."
 ],
 "Submit application": [
  "आवेदन जमा करें",
  "अर्ज सादर करा"
 ],
 "Contact email for the demo record": [
  "डेमो रिकॉर्ड के लिए ईमेल",
  "नमुना नोंदीसाठी ईमेल"
 ],
 "Brief application statement": [
  "आवेदन का संक्षिप्त विवरण",
  "अर्जाचे संक्षिप्त निवेदन"
 ],
 "This prototype does not send email or SMS.": [
  "यह प्रोटोटाइप ईमेल या एसएमएस नहीं भेजता।",
  "हा प्रोटोटाइप ईमेल किंवा एसएमएस पाठवत नाही."
 ],
 "Consent expired or was revoked. Start a new application.": [
  "सहमति समाप्त या वापस ली गई। नया आवेदन शुरू करें।",
  "संमती संपली किंवा मागे घेतली. नवीन अर्ज सुरू करा."
 ],
 "Application received.": [
  "आवेदन प्राप्त हुआ।",
  "अर्ज प्राप्त झाला."
 ],
 "Application reference": [
  "आवेदन संदर्भ",
  "अर्ज संदर्भ"
 ],
 "Application Submitted": [
  "आवेदन जमा हुआ",
  "अर्ज सादर झाला"
 ],
 "Information Verified": [
  "जानकारी सत्यापित",
  "माहिती पडताळली"
 ],
 "Certificate Issuance": [
  "प्रमाणपत्र जारी करना",
  "प्रमाणपत्र वितरण"
 ],
 "View Certificate": [
  "प्रमाणपत्र देखें",
  "प्रमाणपत्र पाहा"
 ],
 "Download receipt": [
  "रसीद डाउनलोड करें",
  "पावती डाउनलोड करा"
 ],
 "View applications": [
  "आवेदन देखें",
  "अर्ज पाहा"
 ],
 "Your Residence Certificate is ready.": [
  "आपका निवास प्रमाणपत्र तैयार है।",
  "तुमचे रहिवास प्रमाणपत्र तयार आहे."
 ],
 "DEMONSTRATION ONLY — not a government certificate": [
  "केवल प्रदर्शन हेतु — सरकारी प्रमाणपत्र नहीं",
  "फक्त प्रात्यक्षिकासाठी — सरकारी प्रमाणपत्र नाही"
 ],
 "Issued": [
  "जारी किया गया",
  "जारी केले"
 ],
 "Close certificate": [
  "प्रमाणपत्र बंद करें",
  "प्रमाणपत्र बंद करा"
 ],
 "Print certificate": [
  "प्रमाणपत्र प्रिंट करें",
  "प्रमाणपत्र छापा"
 ],
 "Clarification response": [
  "स्पष्टीकरण का उत्तर",
  "स्पष्टीकरणाचे उत्तर"
 ],
 "Send clarification": [
  "स्पष्टीकरण भेजें",
  "स्पष्टीकरण पाठवा"
 ],
 "Verified residence information available": [
  "सत्यापित निवास जानकारी उपलब्ध",
  "पडताळलेली रहिवास माहिती उपलब्ध"
 ],
 "Use verified information": [
  "सत्यापित जानकारी उपयोग करें",
  "पडताळलेली माहिती वापरा"
 ],
 "Connected sources": [
  "जुड़े स्रोत",
  "जोडलेले स्रोत"
 ],
 "Manage your consent": [
  "अपनी सहमति प्रबंधित करें",
  "तुमची संमती व्यवस्थापित करा"
 ],
 "Application history": [
  "आवेदन इतिहास",
  "अर्ज इतिहास"
 ],
 "Search name or reference": [
  "नाम या संदर्भ खोजें",
  "नाव किंवा संदर्भ शोधा"
 ],
 "Applicant": [
  "आवेदक",
  "अर्जदार"
 ],
 "Service": [
  "सेवा",
  "सेवा"
 ],
 "Reference": [
  "संदर्भ",
  "संदर्भ"
 ],
 "Status": [
  "स्थिति",
  "स्थिती"
 ],
 "Created": [
  "बनाया गया",
  "तयार केले"
 ],
 "Action": [
  "कार्रवाई",
  "कृती"
 ],
 "Open": [
  "खोलें",
  "उघडा"
 ],
 "No matching applications": [
  "कोई मेल खाता आवेदन नहीं",
  "जुळणारे अर्ज नाहीत"
 ],
 "Saved applications": [
  "सहेजे गए आवेदन",
  "जतन केलेले अर्ज"
 ],
 "Sample API requests": [
  "नमूना API अनुरोध",
  "नमुना API विनंत्या"
 ],
 "Successful requests": [
  "सफल अनुरोध",
  "यशस्वी विनंत्या"
 ],
 "Requests needing attention": [
  "ध्यान देने योग्य अनुरोध",
  "लक्ष आवश्यक असलेल्या विनंत्या"
 ],
 "Residence department review": [
  "निवास विभाग समीक्षा",
  "रहिवास विभाग पुनरावलोकन"
 ],
 "No applications awaiting review": [
  "समीक्षा के लिए कोई आवेदन नहीं",
  "पुनरावलोकनासाठी कोणतेही अर्ज नाहीत"
 ],
 "Approve": [
  "स्वीकृत करें",
  "मंजूर करा"
 ],
 "Request Clarification": [
  "स्पष्टीकरण माँगें",
  "स्पष्टीकरण मागवा"
 ],
 "Reject": [
  "अस्वीकार करें",
  "नाकारा"
 ],
 "Officer note": [
  "अधिकारी की टिप्पणी",
  "अधिकाऱ्याची टिप्पणी"
 ],
 "A reason is required for clarification or rejection.": [
  "स्पष्टीकरण या अस्वीकृति के लिए कारण आवश्यक है।",
  "स्पष्टीकरण किंवा नकारासाठी कारण आवश्यक आहे."
 ],
 "Demo officer mode uses your workspace only.": [
  "डेमो अधिकारी मोड केवल आपके कार्यक्षेत्र में काम करता है।",
  "नमुना अधिकारी मोड फक्त तुमच्या कार्यक्षेत्रात कार्य करतो."
 ],
 "Validation passed": [
  "सत्यापन सफल",
  "पडताळणी यशस्वी"
 ],
 "Notifications": [
  "सूचनाएँ",
  "सूचना"
 ],
 "Residence Certificate approved.": [
  "निवास प्रमाणपत्र स्वीकृत।",
  "रहिवास प्रमाणपत्र मंजूर."
 ],
 "Department request monitoring": [
  "विभाग अनुरोध निगरानी",
  "विभाग विनंती निरीक्षण"
 ],
 "Department": [
  "विभाग",
  "विभाग"
 ],
 "Requests": [
  "अनुरोध",
  "विनंत्या"
 ],
 "Successful": [
  "सफल",
  "यशस्वी"
 ],
 "Latest result": [
  "नवीनतम परिणाम",
  "नवीनतम निकाल"
 ],
 "No requests": [
  "कोई अनुरोध नहीं",
  "विनंत्या नाहीत"
 ],
 "Sample API request console": [
  "नमूना API अनुरोध कंसोल",
  "नमुना API विनंती कन्सोल"
 ],
 "Authorize an application first": [
  "पहले आवेदन को अनुमति दें",
  "आधी अर्जाला परवानगी द्या"
 ],
 "Send request": [
  "अनुरोध भेजें",
  "विनंती पाठवा"
 ],
 "Response": [
  "प्रतिक्रिया",
  "प्रतिसाद"
 ],
 "Source-to-profile mappings": [
  "स्रोत से प्रोफ़ाइल मैपिंग",
  "स्रोत ते प्रोफाइल मॅपिंग"
 ],
 "Department fields → common fields": [
  "विभाग फ़ील्ड → सामान्य फ़ील्ड",
  "विभाग रकाने → सामान्य रकाने"
 ],
 "Actual sample response": [
  "वास्तविक नमूना प्रतिक्रिया",
  "प्रत्यक्ष नमुना प्रतिसाद"
 ],
 "Normalized record": [
  "मानकीकृत रिकॉर्ड",
  "प्रमाणित स्वरूपातील नोंद"
 ],
 "Application permissions": [
  "आवेदन अनुमतियाँ",
  "अर्ज परवानग्या"
 ],
 "Revoking consent blocks new data access and submission. Saved history remains.": [
  "सहमति वापस लेने से नया डेटा उपयोग और जमा करना रुकता है। सहेजा इतिहास रहता है।",
  "संमती मागे घेतल्याने नवीन माहितीचा वापर आणि अर्ज सादरीकरण थांबते. जतन केलेला इतिहास राहतो."
 ],
 "Expires": [
  "समाप्ति",
  "कालबाह्य"
 ],
 "Revoke permission": [
  "अनुमति वापस लें",
  "परवानगी मागे घ्या"
 ],
 "Active": [
  "सक्रिय",
  "सक्रिय"
 ],
 "Revoked": [
  "वापस ली गई",
  "मागे घेतली"
 ],
 "Expired": [
  "समाप्त",
  "कालबाह्य"
 ],
 "No permissions granted yet": [
  "अभी तक कोई अनुमति नहीं",
  "अद्याप परवानग्या दिलेल्या नाहीत"
 ],
 "Your activity": [
  "आपकी गतिविधि",
  "तुमच्या हालचाली"
 ],
 "Export JSON": [
  "JSON निर्यात करें",
  "JSON निर्यात करा"
 ],
 "Time": [
  "समय",
  "वेळ"
 ],
 "Result": [
  "परिणाम",
  "निकाल"
 ],
 "Details": [
  "विवरण",
  "तपशील"
 ],
 "No activity yet": [
  "अभी कोई गतिविधि नहीं",
  "अद्याप हालचाली नाहीत"
 ],
 "Consent granted": [
  "सहमति दी गई",
  "संमती दिली"
 ],
 "Consent revoked": [
  "सहमति वापस ली गई",
  "संमती मागे घेतली"
 ],
 "Consent check": [
  "सहमति जाँच",
  "संमती तपासणी"
 ],
 "Department request": [
  "विभाग अनुरोध",
  "विभाग विनंती"
 ],
 "Validation checked": [
  "सत्यापन जाँचा गया",
  "पडताळणी तपासली"
 ],
 "Application submitted": [
  "आवेदन जमा हुआ",
  "अर्ज सादर झाला"
 ],
 "Department decision": [
  "विभागीय निर्णय",
  "विभागीय निर्णय"
 ],
 "Clarification provided": [
  "स्पष्टीकरण दिया गया",
  "स्पष्टीकरण दिले"
 ],
 "Verified residence reused": [
  "सत्यापित निवास पुनः उपयोग किया",
  "पडताळलेला रहिवास पुन्हा वापरला"
 ],
 "All demonstration rules passed.": [
  "सभी डेमो नियम सफल।",
  "सर्व नमुना नियम यशस्वी."
 ],
 "Residence certificate application": [
  "निवास प्रमाणपत्र आवेदन",
  "रहिवास प्रमाणपत्र अर्ज"
 ],
 "Scholarship application": [
  "छात्रवृत्ति आवेदन",
  "शिष्यवृत्ती अर्ज"
 ],
 "Scholarship verification": [
  "छात्रवृत्ति सत्यापन",
  "शिष्यवृत्ती पडताळणी"
 ],
 "Routed to Residence Department for review.": [
  "समीक्षा के लिए निवास विभाग को भेजा गया।",
  "पुनरावलोकनासाठी रहिवास विभागाकडे पाठवले."
 ],
 "Received for scholarship review.": [
  "छात्रवृत्ति समीक्षा के लिए प्राप्त।",
  "शिष्यवृत्ती पुनरावलोकनासाठी प्राप्त."
 ],
 "Further data access and submission blocked.": [
  "आगे डेटा उपयोग और जमा करना रोका गया।",
  "पुढील माहितीचा वापर आणि सादरीकरण थांबवले."
 ],
 "Simulated department outage.": [
  "डेमो में विभाग अनुपलब्ध।",
  "नमुना विभाग अनुपलब्ध."
 ],
 "Consent → Verified data → Validation → Department review → Tracking": [
  "सहमति → सत्यापित डेटा → सत्यापन → विभागीय समीक्षा → स्थिति",
  "संमती → पडताळलेली माहिती → तपासणी → विभागीय पुनरावलोकन → स्थिती"
 ],
 "Read backend guide": [
  "बैकएंड मार्गदर्शिका पढ़ें",
  "बॅकएंड मार्गदर्शक वाचा"
 ],
 "Raw API values, IDs and user-entered text keep their original form.": [
  "मूल API मान, आईडी और उपयोगकर्ता का लिखा पाठ अपने मूल रूप में रहते हैं।",
  "मूळ API मूल्ये, आयडी आणि वापरकर्त्याने लिहिलेला मजकूर मूळ स्वरूपात राहतो."
 ],
 "Please retry. Your saved application is retained.": [
  "फिर प्रयास करें। आपका आवेदन सुरक्षित है।",
  "पुन्हा प्रयत्न करा. तुमचा अर्ज जतन केलेला आहे."
 ],
 "Department is temporarily unavailable. Retry verification.": [
  "विभाग अस्थायी रूप से अनुपलब्ध है। फिर सत्यापन करें।",
  "विभाग तात्पुरता अनुपलब्ध आहे. पुन्हा पडताळणी करा."
 ],
 "Provide a reason between 10 and 1,000 characters.": [
  "१० से १,००० अक्षरों में कारण दें।",
  "१० ते १,००० अक्षरांत कारण द्या."
 ],
 "Provide a response between 10 and 1,000 characters.": [
  "१० से १,००० अक्षरों में उत्तर दें।",
  "१० ते १,००० अक्षरांत उत्तर द्या."
 ],
 "Consent is revoked or expired. Start a new application with fresh consent.": [
  "सहमति वापस ली गई या समाप्त हुई। नई सहमति के साथ नया आवेदन करें।",
  "संमती मागे घेतली किंवा संपली. नवीन संमतीसह नवीन अर्ज करा."
 ],
 "Complete all required department checks first.": [
  "पहले सभी आवश्यक विभागों की जाँच पूरी करें।",
  "आधी सर्व आवश्यक विभागांची तपासणी पूर्ण करा."
 ],
 "Certificate is available only after department approval.": [
  "प्रमाणपत्र विभाग की स्वीकृति के बाद उपलब्ध होगा।",
  "विभागाच्या मंजुरीनंतरच प्रमाणपत्र उपलब्ध होईल."
 ],
 "Citizen does not match this application.": [
  "नागरिक इस आवेदन से मेल नहीं खाता।",
  "नागरिक या अर्जाशी जुळत नाही."
 ],
 "Submitted applications cannot be verified again.": [
  "जमा किए आवेदन दोबारा सत्यापित नहीं किए जा सकते।",
  "सादर केलेले अर्ज पुन्हा पडताळता येत नाहीत."
 ],
 "API endpoint not found.": [
  "API पता नहीं मिला।",
  "API पत्ता सापडला नाही."
 ],
 "Choose one of the sample citizens.": [
  "नमूना नागरिकों में से एक चुनें।",
  "नमुना नागरिकांपैकी एक निवडा."
 ],
 "Unknown service.": [
  "अज्ञात सेवा।",
  "अज्ञात सेवा."
 ],
 "Consent to all required sources is needed.": [
  "सभी आवश्यक स्रोतों के लिए सहमति आवश्यक है।",
  "सर्व आवश्यक स्रोतांसाठी संमती आवश्यक आहे."
 ],
 "Only applications awaiting department review can be decided.": [
  "केवल विभागीय समीक्षा में लंबित आवेदनों पर निर्णय हो सकता है।",
  "फक्त विभागीय पुनरावलोकनात प्रलंबित अर्जांवर निर्णय घेता येतो."
 ],
 "Choose a valid decision.": [
  "वैध निर्णय चुनें।",
  "वैध निर्णय निवडा."
 ],
 "This application does not need clarification.": [
  "इस आवेदन में स्पष्टीकरण आवश्यक नहीं है।",
  "या अर्जाला स्पष्टीकरण आवश्यक नाही."
 ],
 "Application is already submitted.": [
  "आवेदन पहले ही जमा हो चुका है।",
  "अर्ज आधीच सादर केला आहे."
 ],
 "Invalid application details.": [
  "आवेदन की जानकारी अमान्य है।",
  "अर्जाची माहिती अवैध आहे."
 ],
 "Start an unsubmitted scholarship application first.": [
  "पहले नया छात्रवृत्ति आवेदन शुरू करें।",
  "आधी नवीन शिष्यवृत्ती अर्ज सुरू करा."
 ],
 "Use an approved residence application for the same citizen.": [
  "उसी नागरिक का स्वीकृत निवास आवेदन उपयोग करें।",
  "त्याच नागरिकाचा मंजूर रहिवास अर्ज वापरा."
 ],
 "Verified residence information is unavailable.": [
  "सत्यापित निवास जानकारी उपलब्ध नहीं है।",
  "पडताळलेली रहिवास माहिती उपलब्ध नाही."
 ],
 "Only a verified application can be submitted.": [
  "केवल सत्यापित आवेदन जमा किया जा सकता है।",
  "फक्त पडताळलेला अर्ज सादर करता येतो."
 ],
 "Confirm that you reviewed the application.": [
  "पुष्टि करें कि आपने आवेदन की समीक्षा की है।",
  "तुम्ही अर्जाचे पुनरावलोकन केल्याची पुष्टी करा."
 ],
 "Resolve the validation checks before submission.": [
  "जमा करने से पहले सत्यापन की समस्याएँ ठीक करें।",
  "सादर करण्यापूर्वी पडताळणीतील समस्या सोडवा."
 ],
 "Enter a valid demo contact email.": [
  "वैध डेमो संपर्क ईमेल डालें।",
  "वैध नमुना संपर्क ईमेल टाका."
 ],
 "Write a statement between 20 and 1,000 characters.": [
  "२० से १,००० अक्षरों में विवरण लिखें।",
  "२० ते १,००० अक्षरांत निवेदन लिहा."
 ],
 "Sign in to use the scholarship workspace.": [
  "कार्यक्षेत्र उपयोग करने के लिए साइन इन करें।",
  "कार्यक्षेत्र वापरण्यासाठी साइन इन करा."
 ],
 "This request must come from your workspace.": [
  "यह अनुरोध आपके कार्यक्षेत्र से आना चाहिए।",
  "ही विनंती तुमच्या कार्यक्षेत्रातून आली पाहिजे."
 ],
 "Application not found.": [
  "आवेदन नहीं मिला।",
  "अर्ज सापडला नाही."
 ],
 "A valid JSON request body is required (maximum 12 KB).": [
  "वैध JSON अनुरोध आवश्यक है (अधिकतम १२ KB)।",
  "वैध JSON विनंती आवश्यक आहे (कमाल १२ KB)."
 ],
 "Permission for this source has not been granted.": [
  "इस स्रोत के लिए अनुमति नहीं दी गई है।",
  "या स्रोतासाठी परवानगी दिलेली नाही."
 ],
 "The service could not complete this request. Your saved application is retained. Please retry.": [
  "सेवा अनुरोध पूरा नहीं कर सकी। आवेदन सुरक्षित है। फिर प्रयास करें।",
  "सेवेला विनंती पूर्ण करता आली नाही. अर्ज जतन आहे. पुन्हा प्रयत्न करा."
 ],
 "Data access denied: consent missing, expired or revoked.": [
  "डेटा उपयोग रोका गया: सहमति अनुपस्थित, समाप्त या वापस ली गई है।",
  "माहितीचा वापर नाकारला: संमती नाही, संपली किंवा मागे घेतली आहे."
 ]
};
export const localeFor=(lang:Language)=>lang==='en'?'en-IN':lang+'-IN-u-nu-deva';
export function translate(lang:Language,key:string,params:Record<string,string|number>={}) {
 let value=lang==='en'?key:translations[key]?.[lang==='hi'?0:1]??key;
 for(const [k,v] of Object.entries(params))value=value.replaceAll('{'+k+'}',typeof v==='number'?new Intl.NumberFormat(localeFor(lang)).format(v):v);
 return value;
}
const Context=createContext<any>(null);
export function LanguageProvider({children}:{children:React.ReactNode}){
 const [language,setLanguage]=useState<Language>('en');
 useEffect(()=>{try{const saved=localStorage.getItem('GovSync-language');if(saved==='hi'||saved==='mr')setLanguage(saved);}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=language;try{localStorage.setItem('GovSync-language',language);}catch{}},[language]);
 const t=(key:string,params?:Record<string,string|number>)=>translate(language,key,params);
 const n=(value:number,options?:Intl.NumberFormatOptions)=>new Intl.NumberFormat(localeFor(language),options).format(value);
 const date=(value:string,time=false)=>new Intl.DateTimeFormat(localeFor(language),{day:'numeric',month:'short',year:'numeric',...(time?{hour:'2-digit' as const,minute:'2-digit' as const}:{})}).format(new Date(value));
 const value=(key:string,v:any)=>key==='dateOfBirth'?date(v):typeof v==='number'?n(v):key==='pin'?String(v).replace(/\d/g,(d:string)=>language==='en'?d:'०१२३४५६७८९'[Number(d)]):t(String(v??''));
 return <Context.Provider value={{language,setLanguage,t,n,date,value}}>{children}</Context.Provider>;
}
export const useLanguage=()=>useContext(Context);

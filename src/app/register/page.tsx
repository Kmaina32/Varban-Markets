"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { Check, ShieldCheck, User, Mail, Lock } from "lucide-react";
import placeholderImages from "@/app/lib/placeholder-images.json";

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', prefix: '+93', flag: '🇦🇫' },
  { code: 'AL', name: 'Albania', prefix: '+355', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', prefix: '+213', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', prefix: '+376', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', prefix: '+244', flag: '🇦🇴' },
  { code: 'AR', name: 'Argentina', prefix: '+54', flag: '🇦🇷' },
  { code: 'AM', name: 'Armenia', prefix: '+374', flag: '🇦🇲' },
  { code: 'AU', name: 'Australia', prefix: '+61', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', prefix: '+43', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaijan', prefix: '+994', flag: '🇦🇿' },
  { code: 'BS', name: 'Bahamas', prefix: '+1-242', flag: '🇧🇸' },
  { code: 'BH', name: 'Bahrain', prefix: '+973', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', prefix: '+880', flag: '🇧🇩' },
  { code: 'BB', name: 'Barbados', prefix: '+1-246', flag: '🇧🇧' },
  { code: 'BY', name: 'Belarus', prefix: '+375', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', prefix: '+32', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belize', prefix: '+501', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', prefix: '+229', flag: '🇧🇯' },
  { code: 'BT', name: 'Bhutan', prefix: '+975', flag: '🇧🇹' },
  { code: 'BO', name: 'Bolivia', prefix: '+591', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', prefix: '+387', flag: '🇧🇦' },
  { code: 'BW', name: 'Botswana', prefix: '+267', flag: '🇧🇼' },
  { code: 'BR', name: 'Brazil', prefix: '+55', flag: '🇧🇷' },
  { code: 'BN', name: 'Brunei', prefix: '+673', flag: '🇲🇳' },
  { code: 'BG', name: 'Bulgaria', prefix: '+359', flag: '🇧🇬' },
  { code: 'BF', name: 'Burkina Faso', prefix: '+226', flag: 'BF' },
  { code: 'BI', name: 'Burundi', prefix: '+257', flag: '🇧🇮' },
  { code: 'KH', name: 'Cambodia', prefix: '+855', flag: '🇰🇭' },
  { code: 'CM', name: 'Camperoon', prefix: '+237', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', prefix: '+1', flag: '🇨🇦' },
  { code: 'CV', name: 'Cape Verde', prefix: '+238', flag: '🇨🇻' },
  { code: 'CF', name: 'Central African Republic', prefix: '+236', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', prefix: '+235', flag: '🇹🇩' },
  { code: 'CL', name: 'Chile', prefix: '+56', flag: '🇨🇱' },
  { code: 'CN', name: 'China', prefix: '+86', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', prefix: '+57', flag: '🇨🇴' },
  { code: 'KM', name: 'Comoros', prefix: '+269', flag: '🇰🇲' },
  { code: 'CG', name: 'Congo', prefix: '+242', flag: '🇨🇬' },
  { code: 'CR', name: 'Costa Rica', prefix: '+506', flag: '🇨🇷' },
  { code: 'HR', name: 'Croatia', prefix: '+385', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', prefix: '+53', flag: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', prefix: '+357', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', prefix: '+420', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', prefix: '+45', flag: '🇩🇰' },
  { code: 'DJ', name: 'Djibouti', prefix: '+253', flag: '🇩🇯' },
  { code: 'DM', name: 'Dominica', prefix: '+1-767', flag: '🇩🇲' },
  { code: 'DO', name: 'Dominican Republic', prefix: '+1-809', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', prefix: '+593', flag: '🇪🇨' },
  { code: 'EG', name: 'Egypt', prefix: '+20', flag: '🇪🇬' },
  { code: 'SV', name: 'El Salvador', prefix: '+503', flag: '🇸🇻' },
  { code: 'GQ', name: 'Equatorial Guinea', prefix: '+240', flag: '🇬🇶' },
  { code: 'ER', name: 'Eritrea', prefix: '+291', flag: '🇪🇷' },
  { code: 'EE', name: 'Estonia', prefix: '+372', flag: '🇪🇪' },
  { code: 'ET', name: 'Ethiopia', prefix: '+251', flag: '🇪🇹' },
  { code: 'FJ', name: 'Fiji', prefix: '+679', flag: '🇫🇯' },
  { code: 'FI', name: 'Finland', prefix: '+358', flag: '🇫🇮' },
  { code: 'FR', name: 'France', prefix: '+33', flag: '🇫🇷' },
  { code: 'GA', name: 'Gabon', prefix: '+241', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia', prefix: '+220', flag: '🇬🇲' },
  { code: 'GE', name: 'Georgia', prefix: '+995', flag: '🇬🇪' },
  { code: 'DE', name: 'Germany', prefix: '+49', font: '🇩🇪' },
  { code: 'GH', name: 'Ghana', prefix: '+233', flag: '🇬🇭' },
  { code: 'GR', name: 'Greece', prefix: '+30', flag: '🇬🇷' },
  { code: 'GD', name: 'Grenada', prefix: '+1-473', flag: '🇬🇩' },
  { code: 'GT', name: 'Guatemala', prefix: '+502', flag: '🇬🇹' },
  { code: 'GN', name: 'Guinea', prefix: '+224', flag: '🇬🇳' },
  { code: 'GW', name: 'Guinea-Bissau', prefix: '+245', flag: '🇬🇼' },
  { code: 'GY', name: 'Guyana', prefix: '+592', flag: '🇬🇾' },
  { code: 'HT', name: 'Haiti', prefix: '+509', flag: '🇭🇹' },
  { code: 'HN', name: 'Honduras', prefix: '+504', flag: '🇭🇳' },
  { code: 'HU', name: 'Hungary', prefix: '+36', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', prefix: '+354', flag: '🇮🇸' },
  { code: 'IN', name: 'India', prefix: '+91', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', prefix: '+62', flag: '🇮🇩' },
  { code: 'IR', name: 'Iran', prefix: '+98', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', prefix: '+964', flag: '🇮🇶' },
  { code: 'IE', name: 'Ireland', prefix: '+353', flag: '🇮🇪' },
  { code: 'IL', name: 'Israel', prefix: '+972', flag: '🇮🇱' },
  { code: 'IT', name: 'Italy', prefix: '+39', flag: '🇮🇹' },
  { code: 'JM', name: 'Jamaica', prefix: '+1-876', flag: '🇯🇲' },
  { code: 'JP', name: 'Japan', prefix: '+81', flag: '🇯🇵' },
  { code: 'JO', name: 'Jordan', prefix: '+962', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', prefix: '+7', flag: '🇰🇿' },
  { code: 'KE', name: 'Kenya', prefix: '+254', flag: '🇰🇪' },
  { code: 'KI', name: 'Kiribati', prefix: '+686', flag: '🇰🇮' },
  { code: 'KP', name: 'North Korea', prefix: '+850', flag: '🇰🇵' },
  { code: 'KR', name: 'South Korea', prefix: '+82', flag: '🇰🇷' },
  { code: 'KW', name: 'Kuwait', prefix: '+965', flag: '🇰🇼' },
  { code: 'KG', name: 'Kyrgyzstan', prefix: '+996', flag: '🇰🇬' },
  { code: 'LA', name: 'Laos', prefix: '+856', flag: '🇱🇦' },
  { code: 'LV', name: 'Latvia', prefix: '+371', flag: '🇱🇻' },
  { code: 'LB', name: 'Lebanon', prefix: '+961', flag: '🇱🇧' },
  { code: 'LS', name: 'Lesotho', prefix: '+266', flag: '🇱🇸' },
  { code: 'LR', name: 'Liberia', prefix: '+231', flag: '🇱🇷' },
  { code: 'LY', name: 'Libya', prefix: '+218', flag: '🇱🇾' },
  { code: 'LI', name: 'Liechtenstein', prefix: '+423', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', prefix: '+370', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', prefix: '+352', flag: '🇱🇺' },
  { code: 'MK', name: 'Macedonia', prefix: '+389', flag: '🇲🇰' },
  { code: 'MG', name: 'Madagascar', prefix: '+261', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', prefix: '+265', flag: '🇲🇼' },
  { code: 'MY', name: 'Malaysia', prefix: '+60', flag: '🇲🇾' },
  { code: 'MV', name: 'Maldives', prefix: '+960', flag: '🇲🇻' },
  { code: 'ML', name: 'Mali', prefix: '+223', flag: '🇲🇱' },
  { code: 'MT', name: 'Malta', prefix: '+356', flag: '🇲🇹' },
  { code: 'MH', name: 'Marshall Islands', prefix: '+692', flag: '🇲🇭' },
  { code: 'MR', name: 'Mauritania', prefix: '+222', flag: '🇲🇷' },
  { code: 'MU', name: 'Mauritius', prefix: '+230', flag: '🇲🇺' },
  { code: 'MX', name: 'Mexico', prefix: '+52', flag: '🇲🇽' },
  { code: 'FM', name: 'Micronesia', prefix: '+691', flag: '🇫🇲' },
  { code: 'MD', name: 'Moldova', prefix: '+373', flag: '🇲🇩' },
  { code: 'MC', name: 'Monaco', prefix: '+377', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolia', prefix: '+976', flag: '🇲🇳' },
  { code: 'ME', name: 'Montenegro', prefix: '+382', flag: '🇲🇪' },
  { code: 'MA', name: 'Morocco', prefix: '+212', flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique', prefix: '+258', flag: '🇲🇿' },
  { code: 'MM', name: 'Myanmar', prefix: '+95', flag: '🇲🇲' },
  { code: 'NA', name: 'Namibia', prefix: '+264', flag: '🇳🇦' },
  { code: 'NR', name: 'Nauru', prefix: '+674', flag: '🇳🇷' },
  { code: 'NP', name: 'Nepal', prefix: '+977', flag: '🇳🇵' },
  { code: 'NL', name: 'Netherlands', prefix: '+31', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', prefix: '+64', flag: '🇳🇿' },
  { code: 'NI', name: 'Nicaragua', prefix: '+505', flag: '🇳🇮' },
  { code: 'NE', name: 'Niger', prefix: '+227', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', prefix: '+234', flag: '🇳🇬' },
  { code: 'NO', name: 'Norway', prefix: '+47', flag: '🇳🇴' },
  { code: 'OM', name: 'Oman', prefix: '+968', flag: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', prefix: '+92', flag: '🇵🇰' },
  { code: 'PW', name: 'Palau', prefix: '+680', flag: '🇵🇼' },
  { code: 'PA', name: 'Panama', prefix: '+507', flag: '🇵🇦' },
  { code: 'PG', name: 'Papua New Guinea', prefix: '+675', flag: '🇵🇬' },
  { code: 'PY', name: 'Paraguay', prefix: '+595', flag: '🇵🇾' },
  { code: 'PE', name: 'Peru', prefix: '+51', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', prefix: '+63', flag: '🇵🇭' },
  { code: 'PL', name: 'Poland', prefix: '+48', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', prefix: '+351', flag: '🇵🇹' },
  { code: 'QA', name: 'Qatar', prefix: '+974', flag: '🇶🇦' },
  { code: 'RO', name: 'Romania', prefix: '+40', flag: '🇷🇴' },
  { code: 'RU', name: 'Russia', prefix: '+7', flag: '🇷🇺' },
  { code: 'RW', name: 'Rwanda', prefix: '+250', flag: '🇷🇼' },
  { code: 'KN', name: 'Saint Kitts and Nevis', prefix: '+1-869', flag: '🇰🇳' },
  { code: 'LC', name: 'Saint Lucia', prefix: '+1-758', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', prefix: '+1-784', flag: '🇻🇨' },
  { code: 'WS', name: 'Samoa', prefix: '+685', flag: '🇼🇸' },
  { code: 'SM', name: 'San Marino', prefix: '+378', flag: '🇸🇲' },
  { code: 'ST', name: 'Sao Tome and Principe', prefix: '+239', flag: '🇸🇹' },
  { code: 'SA', name: 'Saudi Arabia', prefix: '+966', flag: '🇸🇦' },
  { code: 'SN', name: 'Senegal', prefix: '+221', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbia', prefix: '+381', flag: '🇷🇸' },
  { code: 'SC', name: 'Seychelles', prefix: '+248', flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leone', prefix: '+232', flag: '🇸🇱' },
  { code: 'SG', name: 'Singapore', prefix: '+65', flag: '🇸🇬' },
  { code: 'SK', name: 'Slovakia', prefix: '+421', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', prefix: '+386', flag: '🇸🇮' },
  { code: 'SB', name: 'Solomon Islands', prefix: '+677', flag: '🇸🇧' },
  { code: 'SO', name: 'Somalia', prefix: '+252', flag: '🇸🇴' },
  { code: 'ZA', name: 'South Africa', prefix: '+27', flag: '🇿🇦' },
  { code: 'ES', name: 'Spain', prefix: '+34', flag: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', prefix: '+94', flag: '🇱🇰' },
  { code: 'SD', name: 'Sudan', prefix: '+249', flag: '🇸🇩' },
  { code: 'SR', name: 'Suriname', prefix: '+597', flag: '🇸🇷' },
  { code: 'SZ', name: 'Swaziland', prefix: '+268', flag: '🇸🇿' },
  { code: 'SE', name: 'Sweden', prefix: '+46', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', prefix: '+41', flag: '🇨🇭' },
  { code: 'SY', name: 'Syria', prefix: '+963', flag: '🇸🇾' },
  { code: 'TW', name: 'Taiwan', prefix: '+886', flag: '🇹🇼' },
  { code: 'TJ', name: 'Tajikistan', prefix: '+992', flag: '🇹🇯' },
  { code: 'TZ', name: 'Tanzania', prefix: '+255', flag: '🇹🇿' },
  { code: 'TH', name: 'Thailand', prefix: '+66', flag: '🇹🇭' },
  { code: 'TG', name: 'Togo', prefix: '+228', flag: '🇹🇬' },
  { code: 'TO', name: 'Tonga', prefix: '+676', flag: '🇹🇴' },
  { code: 'TT', name: 'Trinidad and Tobago', prefix: '+1-868', flag: '🇹🇹' },
  { code: 'TN', name: 'Tunisia', prefix: '+216', flag: '🇹🇳' },
  { code: 'TR', name: 'Turkey', prefix: '+90', flag: '🇹🇷' },
  { code: 'TM', name: 'Turkmenistan', prefix: '+993', flag: '🇹🇲' },
  { code: 'TV', name: 'Tuvalu', prefix: '+688', flag: '🇹🇻' },
  { code: 'UG', name: 'Uganda', prefix: '+256', flag: '🇺🇬' },
  { code: 'UA', name: 'Ukraine', prefix: '+380', flag: '🇺🇦' },
  { code: 'AE', name: 'United Arab Emirates', prefix: '+971', flag: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', prefix: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', prefix: '+1', flag: '🇺🇸' },
  { code: 'UY', name: 'Uruguay', prefix: '+598', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistan', prefix: '+998', flag: '🇺🇿' },
  { code: 'VU', name: 'Vanuatu', prefix: '+678', flag: '🇻🇺' },
  { code: 'VA', name: 'Vatican City', prefix: '+379', flag: '🇻🇦' },
  { code: 'VE', name: 'Venezuela', prefix: '+58', flag: '🇻🇪' },
  { code: 'VN', name: 'Vietnam', prefix: '+84', flag: '🇻🇳' },
  { code: 'YE', name: 'Yemen', prefix: '+967', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambia', prefix: '+260', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', prefix: '+263', flag: '🇿🇼' }
].sort((a, b) => a.name.localeCompare(b.name));

export default function UnifiedSignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryIndex, setCountryIndex] = useState(COUNTRIES.findIndex(c => c.code === 'US'));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    assent: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step < 3) {
      setStep(step + 1);
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Operational parameters mismatch: Passwords do not match.");
        return;
      }
      if (!auth || !db) return;
      setLoading(true);

      const selectedCountry = COUNTRIES[countryIndex];

      createUserWithEmailAndPassword(auth, formData.email, formData.password)
        .then((userCredential) => {
          const user = userCredential.user;
          setDoc(doc(db, "users", user.uid), {
            fullName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: `${selectedCountry.prefix} ${formData.phone}`,
            country: selectedCountry.name,
            balance: 1000.00,
            equity: 1000.00,
            currency: "USD",
            verificationStatus: "Not Verified"
          }).catch(() => {});

          router.push("/dashboard");
        })
        .catch((err: any) => {
          setError(err.message || "Infrastructure handshake failed: Registration could not be concluded.");
          setLoading(false);
        });
    }
  };

  const steps = [
    { title: "Identity", icon: User },
    { title: "Contact", icon: Mail },
    { title: "Security", icon: Lock }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen flex items-center justify-center py-16 px-4">
      <div className="bg-white border border-[#E4E4E4] max-w-5xl w-full shadow-lg flex overflow-hidden min-h-[700px]">
        {/* Left Side: Image */}
        <div className="hidden lg:block w-1/2 relative">
          <Image
            src={placeholderImages.auth.url}
            alt="Varban Infrastructure"
            fill
            className="object-cover"
            data-ai-hint={placeholderImages.auth.hint}
          />
          <div className="absolute inset-0 bg-[#0A0A0A]/20"></div>
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227] block mb-2">Workspace Access</span>
            <h2 className="text-2xl font-bold uppercase text-white tracking-tight leading-tight">
              Institutional Grade Trading Infrastructure
            </h2>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* Light-Themed Progress Header Matrix */}
          <div className="bg-white border-b border-[#E4E4E4] p-8 text-[#0A0A0A] relative overflow-hidden shrink-0">
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227] block mb-2">Varban Markets</span>
              <h1 className="text-2xl font-bold uppercase tracking-tight mb-6">Create Account</h1>
              
              <div className="flex justify-between items-center">
                {steps.map((s, i) => {
                  const stepNum = i + 1;
                  const isComplete = step > stepNum;
                  const isActive = step === stepNum;
                  return (
                    <div key={i} className="flex flex-col items-center space-y-2 relative z-10 w-1/3">
                      <div className={`w-8 h-8 flex items-center justify-center border transition-all duration-300 ${
                        isComplete ? "bg-[#16835B] border-[#16835B] text-white" : 
                        isActive ? "bg-[#C9A227] border-[#C9A227] text-white" : 
                        "border-[#E4E4E4] bg-[#F7F7F5] text-[#6B7280]"
                      }`}>
                        {isComplete ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? "text-[#0A0A0A]" : "text-[#6B7280]"}`}>
                        {s.title}
                      </span>
                    </div>
                  )
                })}
                <div className="absolute top-4 left-1/6 right-1/6 h-px bg-[#E4E4E4] -z-0 w-2/3 mx-auto"></div>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12 flex-grow flex flex-col justify-center">
            {error && (
              <div className="mb-6 p-4 bg-[#C43D3D]/10 border border-[#C43D3D]/20 text-[10px] font-bold text-[#C43D3D] uppercase tracking-wide">
                {error}
              </div>
            )}

            <form onSubmit={handleNext} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border-b border-[#E4E4E4] pb-2 mb-4">
                    <h2 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-[0.15em]">Personal Records</h2>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">First Corporate Name</label>
                    <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] placeholder:text-[#6B7280]/30" placeholder="e.g. John" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Last Corporate Name</label>
                    <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] placeholder:text-[#6B7280]/30" placeholder="e.g. Doe" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border-b border-[#E4E4E4] pb-2 mb-4">
                    <h2 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-[0.15em]">Communication Channels</h2>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Secure Email Address</label>
                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] placeholder:text-[#6B7280]/30" placeholder="trader@institutional.com" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Verified Contact Line</label>
                    <div className="flex gap-2">
                      <select
                        value={countryIndex}
                        onChange={(e) => setCountryIndex(Number(e.target.value))}
                        className="text-xs p-3 border border-[#E4E4E4] rounded-none bg-[#F7F7F5] text-[#0A0A0A] w-32 focus:outline-none focus:border-[#0A0A0A] appearance-none cursor-pointer"
                      >
                        {COUNTRIES.map((c, idx) => (
                          <option key={c.code} value={idx}>
                            {c.flag} {c.prefix}
                          </option>
                        ))}
                      </select>
                      <input 
                        required 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        type="tel" 
                        className="flex-grow text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]" 
                        placeholder="000-0000" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border-b border-[#E4E4E4] pb-2 mb-4">
                    <h2 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-[0.15em]">Infrastructure Safeguards</h2>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Gateway Password</label>
                    <input required name="password" value={formData.password} onChange={handleChange} type="password" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Verification Confirmation</label>
                    <input required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]" />
                  </div>
                  <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-[10px] text-[#6B7280] leading-relaxed space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="relative mt-0.5">
                        <input required name="assent" checked={formData.assent} onChange={handleChange} type="checkbox" className="w-3.5 h-3.5 border-[#E4E4E4] rounded-none focus:ring-0 accent-[#0A0A0A]" />
                      </div>
                      <span className="group-hover:text-[#0A0A0A] transition-colors">
                        I acknowledge the <Link href="/risk-disclosure" className="underline text-[#0A0A0A] font-bold">Institutional Risk Disclosure</Link> protocols.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-between gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="w-1/3 py-4 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-colors"
                  >
                    Previous
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-institutional-primary py-4 ${step > 1 ? 'w-2/3' : 'w-full'}`}
                >
                  {step === 3 ? (loading ? "Processing..." : "Confirm & Commit") : "Next Procedure"}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#E4E4E4] text-center">
              <span className="text-[11px] text-[#6B7280] uppercase tracking-wide">Already authorized? </span>
              <Link href="/login" className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest underline decoration-[#C9A227] decoration-2 underline-offset-4 ml-1">Sign In</Link>
            </div>
          </div>

          <div className="bg-[#F7F7F5] border-t border-[#E4E4E4] p-4 flex items-center justify-center space-x-2 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16835B]" />
            <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em]">Secure Infrastructure Handshake Engaged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
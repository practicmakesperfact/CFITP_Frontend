
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { 
//   ArrowRight, 
//   CheckCircle, 
//   MessageSquare, 
//   Users, 
//   Shield, 
//   BarChart3,
//   Bell,
//   FileText,
//   Clock,
//   Zap,
//   Globe,
//   Mail,
//   Phone,
//   MapPin,
//   Facebook,
//   Twitter,
//   Linkedin,
//   Instagram,
//   ArrowUpRight
// } from "lucide-react";

// export default function HomePage() {
//   // Features data
//   const features = [
//     {
//       icon: <MessageSquare className="text-teal-600" size={24} />,
//       title: "Real-time Feedback",
//       description: "Submit feedback and get instant acknowledgment from our team.",
//       color: "bg-teal-50 border-teal-200"
//     },
//     {
//       icon: <FileText className="text-orange-600" size={24} />,
//       title: "Issue Tracking",
//       description: "Track issues from creation to resolution with full transparency.",
//       color: "bg-orange-50 border-orange-200"
//     },
//     {
//       icon: <Users className="text-purple-600" size={24} />,
//       title: "Team Collaboration",
//       description: "Seamless communication between clients and support teams.",
//       color: "bg-purple-50 border-purple-200"
//     },
//     {
//       icon: <BarChart3 className="text-blue-600" size={24} />,
//       title: "Analytics & Reports",
//       description: "Get insights with detailed reports and analytics dashboards.",
//       color: "bg-blue-50 border-blue-200"
//     },
//     {
//       icon: <Bell className="text-green-600" size={24} />,
//       title: "Smart Notifications",
//       description: "Stay updated with real-time notifications on all activities.",
//       color: "bg-green-50 border-green-200"
//     },
//     {
//       icon: <Shield className="text-red-600" size={24} />,
//       title: "Secure & Reliable",
//       description: "Enterprise-grade security with role-based access control.",
//       color: "bg-red-50 border-red-200"
//     }
//   ];

//   // Stats data
//   const stats = [
//     { number: "24/7", label: "Support Available" },
//     { number: "99.9%", label: "Uptime" },
//     { number: "1000+", label: "Happy Clients" },
//     { number: "5min", label: "Avg Response Time" }
//   ];

//   return (
//     <div className="min-h-screen">
//       {/* Hero Section with Background Image */}
//       <div 
//         className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
//         style={{
//           backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/src/assets/company-background.jpg')",
//         }}
//       >
//         {/* Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-orange-900/20"></div>
        
//         {/* Content */}
//         <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
//               <Zap className="text-yellow-400" size={16} />
//               <span className="text-sm font-medium">Client-Centric Platform</span>
//             </div>
            
//             <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
//               Streamline Your
//               <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400">
//                 Customer Support
//               </span>
//             </h1>
            
//             <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
//               A comprehensive feedback and issue tracking portal that bridges the gap 
//               between your customers and support team. Improve satisfaction, reduce response 
//               time, and grow your business.
//             </p>
            
//             <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
//               <Link
//                 to="/register"
//                 className="group bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl hover:shadow-teal-500/30 hover:scale-105"
//               >
//                 Get Started Free
//                 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
//               </Link>
              
//               <Link
//                 to="/login"
//                 className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center gap-2 hover:scale-105"
//               >
//                 Sign In
//                 <ArrowUpRight size={20} />
//               </Link>
//             </div>
            
//             {/* Stats */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
//               {stats.map((stat, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: index * 0.1 }}
//                   className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10"
//                 >
//                   <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
//                   <div className="text-gray-300 text-sm">{stat.label}</div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
        
//         {/* Scroll Indicator */}
//         <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
//           <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
//             <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
//           </div>
//         </div>
//       </div>

//       {/* Features Section */}
//       <div className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-gray-900 mb-4">
//               Everything You Need in One Platform
//             </h2>
//             <p className="text-gray-600 text-lg max-w-3xl mx-auto">
//               From feedback collection to issue resolution, we provide all the tools 
//               for exceptional customer support management.
//             </p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {features.map((feature, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 viewport={{ once: true }}
//                 className={`p-8 rounded-2xl border-2 ${feature.color} hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
//               >
//                 <div className="w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center mb-6">
//                   {feature.icon}
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-3">
//                   {feature.title}
//                 </h3>
//                 <p className="text-gray-600">
//                   {feature.description}
//                 </p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* CTA Section */}
//       <div className="py-20 px-4 bg-gradient-to-r from-teal-600 to-teal-700">
//         <div className="max-w-5xl mx-auto text-center">
//           <h2 className="text-4xl font-bold text-white mb-6">
//             Ready to Transform Your Customer Support?
//           </h2>
//           <p className="text-teal-100 text-lg mb-10 max-w-3xl mx-auto">
//             Join thousands of companies that trust our platform for their feedback 
//             and issue tracking needs. Start your free trial today.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               to="/register"
//               className="bg-white text-teal-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl hover:scale-105"
//             >
//               Start Free Trial
//               <ArrowRight className="group-hover:translate-x-2 transition-transform" />
//             </Link>
//             <Link
//               to="/login"
//               className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
//             >
//               Schedule Demo
//               <Clock size={20} />
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Shield,
  BarChart3,
  Bell,
  FileText,
  Zap,
  Building,
  Lightbulb,
  Target,
  Globe,
  Award,
  Cpu,
  Database,
  Cloud,
  Mail, 
  Phone,
} from "lucide-react";

export default function HomePage() {
  // Features data - Customized for AITB
  const features = [
    {
      icon: <MessageSquare className="text-[#0F4C81]" size={24} />,
      title: "Real-time Feedback System",
      description:
        "Collect instant feedback from citizens and stakeholders to improve public services.",
      color: "bg-blue-50 border-blue-200",
    },
    {
      icon: <FileText className="text-[#2E8B57]" size={24} />,
      title: "Issue Tracking & Management",
      description:
        "Track technology issues from submission to resolution with complete transparency.",
      color: "bg-green-50 border-green-200",
    },
    {
      icon: <Cpu className="text-[#8B4513]" size={24} />,
      title: "Technology Innovation Support",
      description:
        "Support innovative tech projects and monitor their progress effectively.",
      color: "bg-amber-50 border-amber-200",
    },
    {
      icon: <Users className="text-[#6A5ACD]" size={24} />,
      title: "Stakeholder Collaboration",
      description:
        "Facilitate seamless communication between departments, partners, and citizens.",
      color: "bg-purple-50 border-purple-200",
    },
    {
      icon: <BarChart3 className="text-[#008080]" size={24} />,
      title: "Performance Analytics",
      description:
        "Monitor innovation metrics and generate detailed reports for decision-making.",
      color: "bg-teal-50 border-teal-200",
    },
    {
      icon: <Shield className="text-[#8B0000]" size={24} />,
      title: "Secure Government Platform",
      description:
        "Enterprise-grade security with role-based access control for government data.",
      color: "bg-red-50 border-red-200",
    },
  ];

  // Stats data for AITB
  const stats = [
    { number: "24/7", label: "Public Service Support" },
    { number: "99.8%", label: "System Reliability" },
    { number: "50+", label: "Innovation Projects" },
    { number: "2hr", label: "Avg Response Time" },
  ];

  // AITB Core Values
  const values = [
    {
      icon: <Lightbulb className="text-yellow-600" size={20} />,
      title: "Innovation",
      description: "Fostering technological advancement in Amhara region",
    },
    {
      icon: <Target className="text-green-600" size={20} />,
      title: "Excellence",
      description: "Delivering quality technology services to stakeholders",
    },
    {
      icon: <Globe className="text-blue-600" size={20} />,
      title: "Digital Transformation",
      description: "Modernizing government services through technology",
    },
    {
      icon: <Award className="text-purple-600" size={20} />,
      title: "Accountability",
      description: "Transparent tracking and reporting of all initiatives",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Government Theme */}
      <div
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15, 76, 129, 0.85), rgba(15, 76, 129, 0.9)), url('/src/assets/company-background.jpg')",
        }}
      >
        {/* Government pattern overlay - Fixed SVG */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* AITB Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-white/30">
              <Building className="text-yellow-300" size={20} />
              <span className="text-sm font-semibold">
                Amhara Innovation Technology Bureau
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Advancing Technology
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300">
                For Amhara Region
              </span>
            </h1>

            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
              Official feedback and issue tracking portal for monitoring
              technology initiatives, collecting stakeholder feedback, and
              managing innovation projects across the Amhara region.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl hover:shadow-yellow-500/30 hover:scale-105"
              >
                <Building size={20} />
                Register as Partner
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/25 transition-all duration-300 border-2 border-white/30 flex items-center justify-center gap-2 hover:scale-105"
              >
                <FileText size={20} />
                Submit Feedback
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-200 text-sm font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1.5 h-4 bg-yellow-300 rounded-full mt-3"></div>
          </div>
        </div>
      </div>

      {/* AITB Values Section */}
      <div className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F4C81] mb-4">
              Our Core Values & Mission
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Committed to driving technological innovation and digital
              transformation across the Amhara region through transparent and
              efficient governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Technology Management Platform
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Designed specifically for government innovation bureaus to
              streamline operations, enhance transparency, and improve citizen
              engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-8 rounded-2xl border-2 ${feature.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-[#0F4C81] to-[#2E8B57]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Leveraging cutting-edge technologies to ensure reliability,
              security, and scalability for government operations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center">
              <Database className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="font-semibold text-white">PostgreSQL</h4>
              <p className="text-blue-100 text-sm">Secure Database</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center">
              <Cpu className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="font-semibold text-white">Django REST</h4>
              <p className="text-blue-100 text-sm">Robust Backend</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center">
              <Cloud className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="font-semibold text-white">React + Vite</h4>
              <p className="text-blue-100 text-sm">Modern Frontend</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center">
              <Shield className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="font-semibold text-white">JWT Security</h4>
              <p className="text-blue-100 text-sm">Enterprise Security</p>
            </div>
          </div>
        </div>
      </div>

      {/* Updated CTA Section for AITB */}
      <div className="py-20 px-4 bg-gradient-to-r from-[#2E8B57] to-[#0F4C81]">
        <div className="max-w-5xl mx-auto text-center">
          {/* AITB Logo/Header */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/20">
            <Building className="text-yellow-300" size={24} />
            <span className="text-white font-bold text-lg">
              Amhara Innovation Technology Bureau
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6">
            Join Our Digital Transformation Journey
          </h2>

          <p className="text-blue-100 text-lg mb-10 max-w-3xl mx-auto leading-relaxed">
            As part of the Amhara region's commitment to technological
            advancement, this platform enables government agencies, innovation
            partners, and citizens to collaborate effectively on technology
            initiatives.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-left max-w-sm">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Target className="text-yellow-300" />
                For Government Agencies
              </h4>
              <ul className="text-blue-100 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mt-1.5"></div>
                  Track innovation project progress
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mt-1.5"></div>
                  Monitor stakeholder feedback
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mt-1.5"></div>
                  Generate performance reports
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-left max-w-sm">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Lightbulb className="text-green-300" />
                For Innovation Partners
              </h4>
              <ul className="text-blue-100 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full mt-1.5"></div>
                  Submit technology proposals
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full mt-1.5"></div>
                  Report project updates
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full mt-1.5"></div>
                  Access government resources
                </li>
              </ul>
            </div>
          </div>

          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-yellow-500/30 hover:scale-105"
            >
              <Building size={22} />
              Register Your Organization
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <FileText size={22} />
              Access Platform
            </Link>
          </div>

          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-100 mb-4">
              For government inquiries and technical support:
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a
                href="mailto:info@aitb.amhara.gov.et"
                className="text-white hover:text-yellow-300 transition-colors flex items-center gap-2"
              >
                <Mail size={16} />
                info@aitb.amhara.gov.et
              </a>
              <a
                href="tel:+251XXXXXXXXX"
                className="text-white hover:text-yellow-300 transition-colors flex items-center gap-2"
              >
                <Phone size={16} />
                +251 XXX XXX XXX
              </a>
              <div className="text-white flex items-center gap-2">
                <Building size={16} />
                Amhara Regional Government Complex
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
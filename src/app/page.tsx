// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }







"use client";
import Image from "next/image";
import Link from "next/link";

import { useState, useEffect, useRef } from "react";
import { FaRightToBracket } from "react-icons/fa6";
import styles from "@/styles/home.module.css";
import qr_styles from "@/styles/qr.module.css";
import htw_styles from "@/styles/howitworks.module.css";
import future_styles from "@/styles/future.module.css";
import trust_styles from "@/styles/trust.module.css";
import join_styles from "@/styles/join.module.css"
import AnimatedContent from '../components/Animations/AnimatedContent';
import BounceCards from '../components/Animations/BounceCards';
import CountUp from '../components/Animations/CountUp';

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";


export default function HomePage() {
  const words = ["Photographer", "Weddings", "Corporate Events", "Social Events", "Tours"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [bounce, setBounce] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    "/card1.jpg",
    "/card2.jpg",
    "/card3.jpg",
    "/card4.jpg",
    "/card5.jpg",
    "/card6.jpg",
  ];

  const transformStyles = [
    "rotate(5deg) translate(-380px)",
    "rotate(0deg) translate(-240px)",
    "rotate(-5deg) translate(-80px)",
    "rotate(0deg) translateY(-5px) translateX(90px)",
    "rotate(-4deg) translateY(20px) translateX(250px)",
    "rotate(-5deg) translate(400px)",
  ];

  // review data
  const reviews = [
    {
      text: "The guests really enjoy being interactive at the party. It's cheaper than hiring a photographer and I absolutely love the pics and videos from the guests perspective.",
      name: "Alice Johnson",
      profile: "/profile-vector.svg",
      stars: "/5stars.png",
    },
    {
      text: "The guests really enjoy being interactive at the party. It's cheaper than hiring a photographer and I absolutely love the pics and videos from the guests perspective.",
      name: "Mark Lee",
      profile: "/profile-vector.svg",
      stars: "/5stars.png",
    },
    {
      text: "The guests really enjoy being interactive at the party. It's cheaper than hiring a photographer and I absolutely love the pics and videos from the guests perspective.",
      name: "Sophie Turner",
      profile: "/profile-vector.svg",
      stars: "/5stars.png",
    },
  ];

  // Word bounce effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBounce(false); // start exit animation
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setBounce(true); // start bounce animation
      }, 300); // exit duration
    }, 2000); // total time per word
    return () => clearInterval(interval);
  }, []);


  // Scroll-triggered animation for BounceCards
  const [animateCards, setAnimateCards] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimateCards(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 } // trigger when 30% visible
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <AnimatedContent
        distance={100}
        direction="vertical"
        reverse={false}
        duration={1}
        initialOpacity={0.2}
        animateOpacity
        scale={1}
        threshold={0.2}
        delay={0.3}
      >
        <div><section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 md:py-16 lg:py-20 flex flex-col md:flex-row justify-between items-center gap-12 lg:gap-20">

          {/* Left Section */}
          <div className="w-full md:w-1/2 flex flex-col gap-6 justify-center items-start">
            <h1 className={styles.heading}>
              <span className={styles.headingPrimary}>AI Photo sharing</span>
              <span className={styles.headingPrimary}>Solution for</span>
              <span
                className={`${styles.headingHighlight} ${bounce ? styles.bounceIn : styles.bounceOut}`}
              >
                {words[currentWordIndex]}
              </span>
            </h1>

            <p className={styles.subText}>
              Create Memories Anywhere, Anytime. With <br />Powerful Digital Album Solution
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/auth">
                <button className={styles.uploadButton}>
                  <FaRightToBracket className="inline mr-2" />
                  Sign Up Now
                </button>
              </Link>
            </div>
          </div>

          {/* Right Section */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-10 md:mt-0">
            <Image
              src="/Mobile-mockup.svg"
              alt="Mobile Mockup"
              width={400}
              height={400}
              className={styles.mobileImage}
            />
          </div>
        </section></div>
      </AnimatedContent>


      {/* Card section */}
      <AnimatedContent
        distance={100}
        direction="vertical"
        reverse={false}
        duration={1}
        initialOpacity={0.2}
        animateOpacity
        scale={1}
        threshold={0.2}
        delay={0.3}
      >
        <section
          ref={sectionRef}
          className={`${qr_styles.qrSection} max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col items-center justify-center min-h-screen text-center`}
        >
          <h2 className={qr_styles.heading}>
            QR Code Photo
            <br />
            Sharing Made Simple
          </h2>

          <p className={qr_styles.subText}>
            A QR code gives your guests an instant way to add their photos to your event collection.
            Everyone can easily contribute their perspective — whether it's photos from the dance floor,
            videos of special moments, or audio messages that capture the joy of your celebration.
            All content is automatically organized in your private digital album.
          </p>

          {/* Responsive Bounce Cards */}
          <div className="mt-20 w-full flex justify-center">
            {animateCards && (
              <div className="w-full max-w-full sm:max-w-[700px] h-[50vw] max-h-[400px] flex justify-center
                    lg:scale-100 md:scale-90 sm:scale-75">
                <BounceCards
                  className="custom-bounceCards w-full h-full"
                  images={images}
                  containerWidth={700}
                  animationDelay={0.8}
                  animationStagger={0.08}
                  easeType="elastic.out(1, 0.5)"
                  transformStyles={transformStyles}
                  enableHover={false}
                />
              </div>
            )}
          </div>
        </section>
      </AnimatedContent>


      {/* How It Works Section */}
      <AnimatedContent
        distance={100}
        direction="vertical"
        reverse={false}
        duration={1}
        initialOpacity={0.2}
        animateOpacity
        scale={1}
        threshold={0.2}
        delay={0.3}
      >
        <div><section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold ${htw_styles.gradientText}`}>
              How does it work?
            </h2>
            <p className={`mt-4 text-center ${htw_styles.subText} text-lg`}>
              Hassle-free experience - for you and your party guests.
            </p>
          </div>

          {/* Step 1 - Image on Right */}
          <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
            {/* Left Content */}
            <div className="md:w-1/2 flex items-start gap-4 order-1">
              <div className={htw_styles.circleStep}>01</div>
              <div className="flex flex-col">
                <span className={htw_styles.stepLabel}>Step 1:</span>
                <span className={htw_styles.stepHeading}>Upload Your Photos</span>
                <span className={htw_styles.stepSubtext}>
                  Effortlessly upload your photos to the platform — quick, simple, and secure. Ideal for photographers and everyday users alike.
                </span>

                <Link href="/auth">
                  <button className={htw_styles.button}>Upload</button>
                </Link>

              </div>
            </div>

            {/* Right Image */}
            <div className="md:w-1/2 flex justify-center md:justify-end mt-6 md:mt-0 order-2">
              <Image
                src="/step1-image.svg"
                alt="Step 1 Image"
                width={250}
                height={250}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Step 2 - Image on Left */}
          <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
            {/* Content first on mobile */}
            <div className="md:w-1/2 flex items-start gap-4 order-1 md:order-2 mt-6 md:mt-0">
              <div className={htw_styles.circleStep}>02</div>
              <div className="flex flex-col">
                <span className={htw_styles.stepLabel}>Step 2:</span>
                <span className={htw_styles.stepHeading}>Create Groups</span>
                <span className={htw_styles.stepSubtext}>
                  Organize your memories into custom groups for events and occasions. Perfect for weddings, school trips, and family reunions.
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="md:w-1/2 flex justify-center md:justify-start order-2 md:order-1">
              <Image
                src="/step2-image.svg"
                alt="Step 2 Image"
                width={400}
                height={300}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Step 3 - Image on Right */}
          <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
            {/* Left Content */}
            <div className="md:w-1/2 flex items-start gap-4 order-1">
              <div className={htw_styles.circleStep}>03</div>
              <div className="flex flex-col">
                <span className={htw_styles.stepLabel}>Step 3:</span>
                <span className={htw_styles.stepHeading}>AI Recognition</span>
                <span className={htw_styles.stepSubtext}>
                  Let our smart engine automatically identify faces in your photos. Save time with instant and accurate recognition.
                </span>
              </div>
            </div>

            {/* Right Image */}
            <div className="md:w-1/2 flex justify-center md:justify-end mt-6 md:mt-0 order-2">
              <Image
                src="/step3-image.svg"
                alt="Step 3 Image"
                width={300}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Step 4 - Image on Left */}
          <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
            {/* Content first on mobile */}
            <div className="md:w-1/2 flex items-start gap-4 order-1 md:order-2 mt-6 md:mt-0">
              <div className={htw_styles.circleStep}>04</div>
              <div className="flex flex-col">
                <span className={htw_styles.stepLabel}>Step 4:</span>
                <span className={htw_styles.stepHeading}>Smart Distribution</span>
                <span className={htw_styles.stepSubtext}>
                  Photos are auto-sorted and shared only with the right people. Ensuring privacy and a personalized viewing experience.
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="md:w-1/2 flex justify-center md:justify-start order-2 md:order-1">
              <Image
                src="/step4-image.svg"
                alt="Step 4 Image"
                width={400}
                height={300}
                className="rounded-lg"
              />
            </div>
          </div>

        </section></div>
      </AnimatedContent>


      {/* Future of Photo Sharing Section */}
      <section className="bg-[#E6F9FA] py-16 px-4 sm:px-6 lg:px-12">
        <AnimatedContent
          distance={100}
          direction="vertical"
          reverse={false}
          duration={1}
          initialOpacity={0.2}
          animateOpacity
          scale={1}
          threshold={0.2}
          delay={0.3}
        >
          <div className={`max-w-7xl mx-auto bg-white rounded-xl flex flex-col gap-8 shadow ${future_styles.card}`}>

            {/* Flex Section: Heading + Text + Image */}
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Heading for Mobile */}
              <h2 className={`text-3xl md:text-4xl font-bold order-1 md:order-1 text-center md:text-left w-full ${future_styles.gradientText}`}>
                Welcome to the Future of Photo Sharing
              </h2>

              {/* Right Section: Image */}
              <div className="md:w-1/2 flex justify-center md:justify-end order-2 md:order-3 mt-6 md:mt-0">
                <Image
                  src="/future-section.svg"
                  alt="Future of Photo Sharing"
                  width={400}
                  height={300}
                  className="rounded-lg max-w-full h-auto"
                />
              </div>

              {/* Left Section: Text + Buttons */}
              <div className="md:w-1/2 flex flex-col gap-6 order-3 md:order-2">
                <p className={future_styles.subText}>
                  At Klickshare, we believe the memories deserve more than just storage — they deserve intelligent sharing.
                  We present a next-generation photo sharing platform designed to simplify how moments are captured, organized, and shared using facial recognition and modern group-based distribution.
                </p>

                <div className={`flex gap-4 mt-4 flex-wrap ${future_styles.buttonContainer}`}>
                  
                  {/* <button className={future_styles.pricingButton}>Pricing</button> */}
                  <Link href="/auth">
                    <button className={future_styles.joinButton}>
                      Join Group
                    </button>
                  </Link>
                </div>

              </div>
            </div>

            {/* Thin line */}
            <div className="w-full border-t border-gray-300 my-8"></div>

            {/* Three Info Sections */}
            <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-20">
              {/* Info Section 1 */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 md:w-1/3">
                <Image
                  src="/facial-recognition.svg"
                  alt="Info 1"
                  width={50}
                  height={50}
                  className="flex-shrink-0"
                />
                <div className="flex flex-col text-center sm:text-left">
                  <span className={future_styles.infoHeading}>Facial Recognition</span>
                  <span className={future_styles.infoSubtext}>
                    Automatically find your photos with smart facial recognition—no endless scrolling.
                  </span>
                </div>
              </div>

              {/* Info Section 2 */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 md:w-1/3">
                <Image
                  src="/quality-retention.svg"
                  alt="Info 2"
                  width={50}
                  height={50}
                  className="flex-shrink-0"
                />
                <div className="flex flex-col text-center sm:text-left">
                  <span className={future_styles.infoHeading}>Quality Retention</span>
                  <span className={future_styles.infoSubtext}>
                    Automatically find your photos with smart facial recognition—no endless scrolling.
                  </span>
                </div>
              </div>

              {/* Info Section 3 */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-7 md:w-1/3">
                <Image
                  src="/unlimited-event-group.svg"
                  alt="Info 3"
                  width={50}
                  height={50}
                  className="flex-shrink-0"
                />
                <div className="flex flex-col text-center sm:text-left">
                  <span className={future_styles.infoHeading}>Unlimited Event Groups</span>
                  <span className={future_styles.infoSubtext}>
                    Automatically find your photos with smart facial recognition—no endless scrolling.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </AnimatedContent>
      </section>


      {/* Trusted QR Code Photo Sharing Section */}
      <section className="bg-[#ffffff] py-16 px-4 sm:px-6 lg:px-12">
        <AnimatedContent
          distance={100}
          direction="vertical"
          reverse={false}
          duration={1}
          initialOpacity={0.2}
          animateOpacity
          scale={1}
          threshold={0.2}
          delay={0.3}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12 md:gap-30">

            {/* LEFT SECTION */}
            <div className="w-full md:w-1/2 flex flex-col gap-6">

              {/* Heading */}
              <h2 className={`text-3xl md:text-4xl font-bold ${trust_styles.gradientText} text-center md:text-left`}>
                Trusted QR Code Photo Sharing Worldwide
              </h2>

              {/* Subtext */}
              <p className={`${trust_styles.subText} text-center md:text-left`}>
                At Klickshare, we believe the memories deserve more than just storage — they deserve intelligent sharing.
                We present a next-generation photo sharing platform designed to simplify how moments are captured,
                organized, and shared using facial recognition and modern group-based distribution.
              </p>

              {/* Vertical Cards */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mt-4 justify-center md:justify-start">
                {/* Card 1 */}
                <div className={`flex justify-center items-center gap-4 p-4 ${trust_styles.trustCard} w-full sm:w-[48%] md:w-full`}>
                  <Image
                    src="/15K.svg"
                    alt="Trust Card 1"
                    width={50}
                    height={50}
                    className="flex-shrink-0"
                  />
                  <div>
                    <h4 className={trust_styles.cardHeading}>
                      <CountUp from={0} to={15} separator="," duration={1} />K
                    </h4>
                    <p className={trust_styles.cardSubtext}>Active Users On App</p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className={`flex justify-center items-center gap-4 p-4 ${trust_styles.trustCard} w-full sm:w-[48%] md:w-full`}>
                  <Image
                    src="/1M.svg"
                    alt="Trust Card 2"
                    width={50}
                    height={50}
                    className="flex-shrink-0"
                  />
                  <div>
                    <h4 className={trust_styles.cardHeading}>
                      <CountUp from={0} to={1} separator="," duration={1} />M
                    </h4>
                    <p className={trust_styles.cardSubtext}>Photos Uploaded & Shared</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className={`flex justify-center items-center gap-4 p-4 ${trust_styles.trustCard} w-full sm:w-[48%] md:w-full`}>
                  <Image
                    src="/ninenine.svg"
                    alt="Trust Card 3"
                    width={50}
                    height={50}
                    className="flex-shrink-0"
                  />
                  <div>
                    <h4 className={trust_styles.cardHeading}>
                      <CountUp from={0} to={99} duration={1} />%
                    </h4>
                    <p className={trust_styles.cardSubtext}>Face Recognition Accuracy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-10 md:mt-0">
              <div className={`w-full md:w-[90%] flex flex-col justify-between ${trust_styles.rightCard} p-6 md:p-12`}>

                {/* Points */}
                <div className="flex flex-col gap-6 md:gap-8">
                  {/* Map each point */}
                  {[
                    { icon: '/point1.svg', title: 'High resolution photos', text: 'Automatically find your photos with smart facial recognition—no endless scrolling.' },
                    { icon: '/point2.svg', title: 'One-click Download', text: 'With just one click, you can download all photos to your device or cloud storage.' },
                    { icon: '/point3.svg', title: 'Private & Secured', text: 'Your photos are private. Only you and those you share them with can access them.' },
                    { icon: '/point4.svg', title: 'Customizations', text: 'Create a personalized experience by customizing everything with your brand\'s colors and style.' },
                    { icon: '/point5.svg', title: 'High resolution photos', text: 'Automatically find your photos with smart facial recognition—no endless scrolling.' }
                  ].map((point, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start gap-4 sm:gap-10">
                      <div className={trust_styles.circle}>
                        <Image src={point.icon} alt={point.title} width={24} height={24} />
                      </div>
                      <div>
                        <h4 className={`mb-2 md:mb-3 ${trust_styles.pointHeading}`}>{point.title}</h4>
                        <p className={trust_styles.pointSubtext}>{point.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </AnimatedContent>
      </section>


      {/* Join Future Of Photo Sharing Section */}
      <AnimatedContent
        distance={100}
        direction="vertical"
        reverse={false}
        duration={1}
        initialOpacity={0.2}
        animateOpacity
        scale={1}
        threshold={0.2}
        delay={0.3}
      >

        <section className={`${join_styles.joinSection} relative w-full`}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:py-0 py-10 flex flex-col lg:flex-row flex-wrap items-end justify-between gap-6 sm:gap-10 w-full min-h-screen md:w-auto">
            {/* Left Side */}
            <div className="flex-1 flex flex-col gap-4 lg:px-12 z-10 text-center lg:text-left justify-end">
              <h2 className={join_styles.gradientText}>Join Future Of Photo Sharing</h2>
              <p className="text-[#697E7F] text-base sm:text-lg">
                Stand out with professionalism and leave a lasting impression.
              </p>
              <Link href="/auth">
                <button className="bg-[#F4C900] text-black font-semibold px-6 py-3 rounded-lg w-max mx-auto lg:mx-0 hover:scale-105 transition-transform">
                  SignUp / Login
                </button>
              </Link>
            </div>
                  
            {/* Right Side */}
            <div className="flex-1 flex flex-col items-center relative z-10 w-full sm:w-auto mt-8 lg:mt-0 justify-end">
              {/* Review Box */}
              <div className={`${join_styles.dialogueBox} w-full max-w-[90%] sm:max-w-[520px]`}>
                <Swiper
                  modules={[Autoplay]}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  loop={true}
                  onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
                  className="w-full"
                >

                  {reviews.map((review, idx) => (
                    <SwiperSlide key={idx}>
                      <p className="text-center text-[#333] text-base sm:text-lg leading-relaxed">
                        {review.text}
                      </p>
                      <div className="flex justify-center mt-4">
                        <Image src="/stars.svg" alt="Stars" width={140} height={24} />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Downward Triangle */}
              <div className={join_styles.triangle}></div>

              {/* Profile Circle + Name */}
              <div className="flex items-center gap-3 sm:gap-4 mt-4">
                <div className={join_styles.profileCircle}>
                  <Image
                    src={reviews[currentSlide].profile}
                    alt={reviews[currentSlide].name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <span className="font-semibold text-[#1F6563] text-base sm:text-lg">
                  {reviews[currentSlide].name}
                </span>
              </div>
            </div>

          </div>
        </section>
      </AnimatedContent>
    </>
  );
}
import Image from 'next/image';

const STEPS = [
  {
    num: 1,
    title: 'Install the My Telenor App',
    desc: 'Download and install the official My Telenor App from the Google Play Store or the Apple App Store and log in with your Telenor number. ',
    img: '/assets/tele-answer-step-install.webp',
  },
  {
    num: 2,
    title: 'Log In with Your Telenor SIM',
    desc: 'Open the app and sign in using your active Telenor mobile number. Enter the verification code to confirm and complete the login process.',
    img: '/assets/tele-answer-step-login.webp',
  },
  {
    num: 3,
    title: 'Navigate to the "Play & Win" Section',
    desc: 'Open the app and stay on the home screen. Scroll down to find the Telenor Play and Win or Test Your Skills section. Tap the section to continue.',
    img: '/assets/tele-answer-step-play-win.webp',
  },
  {
    num: 4,
    title: 'Answer 5 Quiz Questions',
    desc: 'In this step, you will be presented with 5 multiple-choice questions. Take your time to read each question carefully before selecting the correct answer. The quiz is designed to be simple and straightforward, with questions based on general knowledge questions pakistan.',
    img: null,
  },
  {
    num: 5,
    title: 'Claim Your Reward',
    desc: 'Answer the questions and submit them directly in the app. If you choose the correct option, the app credits your reward instantly to your account, such as free MBs, SMS, or call minutes.',
    img: '/assets/Claim-Your-Reward.webp',
  },
];

export default function StepsSection() {
  return (
    <section id="steps-to-participate" className="my-8">
      <h2 className="font-heading font-bold text-xl text-text-primary mb-6">
        Steps to Participate
      </h2>
      <div className="space-y-6">
        {STEPS.map((step) => (
          <div key={step.num} className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-accent text-white font-bold text-sm flex items-center justify-center">
              {step.num}
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary mb-1">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
              {step.img && (
                <div className="mt-3 relative w-80 aspect-[2/3] rounded-lg overflow-hidden shadow-sm border border-border">
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="800px"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

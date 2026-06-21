import Image from 'next/image';

const STEPS = [
  {
    num: 1,
    title: 'Install the My Telenor App',
    desc: 'Download from the Google Play Store or Apple App Store and log in with your Telenor number.',
    img: '/assets/tele-answer-step-install.webp',
  },
  {
    num: 2,
    title: 'Log in with Your Telenor SIM',
    desc: 'Open the app and register with your Telenor number. The login process takes only a moment.',
    img: '/assets/tele-answer-step-login.jpg',
  },
  {
    num: 3,
    title: 'Open the Play & Win Section',
    desc: 'From the home screen, scroll down and tap the Telenor Play & Win or Test Your Skills section.',
    img: '/assets/tele-answer-step-play-win.jpg',
  },
  {
    num: 4,
    title: 'Answer Five Quiz Questions',
    desc: 'Read each of the 5 multiple-choice questions carefully and select the best answer.',
    img: null,
  },
  {
    num: 5,
    title: 'Get Your Free Internet Reward',
    desc: 'Answer all five correctly and receive 150 MB of free internet credited directly to your Telenor account.',
    img: '/assets/tele-answer-step-answers.webp',
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
                <div className="mt-3 relative w-40 aspect-[2/3] rounded-lg overflow-hidden shadow-sm border border-border">
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="160px"
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

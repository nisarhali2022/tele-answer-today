// All the static informational sections in one file
// (What is, How to Find, How to Play, Why People Love, Who Can Join, Rewards, Problems, Tips, Conclusion)

export default function QuizInfoSections() {
  return (
    <div className="render-deferred">
      {/* ── What is the Telenor Daily Quiz ── */}
      <section id="what-is-telenor-daily-quiz" className="my-8">
        <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
          What is the Telenor Daily Quiz?
        </h2>
        <div className="text-sm text-text-secondary leading-relaxed space-y-3">
          <p>
            The Telenor Quiz Today offers a quick and engaging challenge inside the My Telenor App.
            You can access it through the <strong className="text-text-primary">"Test Your Skills today"</strong> section,
            where five multiple-choice questions appear each day covering Pakistan studies, technology
            trends, general knowledge, and world festivals.
          </p>
          <p>
            The <strong className="text-text-primary">Telenor Daily Quiz</strong> stands out as one of the most popular
            features inside the MyTelenor App. Each day, users answer five questions covering Pakistan
            Studies, science, current affairs, Islamic knowledge, and general knowledge. Every correct
            attempt unlocks <strong className="text-text-primary">150 MB free internet data instantly</strong>, with no
            delays and no redemption process.
          </p>
        </div>
      </section>

      {/* ── How to Find Answers ── */}
      <section id="find-correct-answers" className="my-8">
        <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
          How to Find the Correct My Telenor Quiz Answers Today Instantly?
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          You can access the My Telenor Today Quiz Answer within seconds using the MyTelenor App.
          Start by opening the app on your smartphone and sign in with your Telenor number. Once you
          reach the home screen, navigate to the Today Quiz or Rewards section to view the latest
          daily question. Read the question carefully, choose the correct option, and submit your
          answer to receive free internet MBs instantly.
        </p>
      </section>

      {/* ── How to Play ── */}
      <section id="how-to-play" className="my-8">
        <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
          How to Play the Telenor Quiz Today and Win Free MBs?
        </h2>
        <div className="text-sm text-text-secondary leading-relaxed space-y-3">
          <p>
            Install the My Telenor App from the Google Play Store or Apple App Store and log in with
            your active Telenor number. After signing in, tap the{' '}
            <strong className="text-text-primary">Play &amp; Win</strong> or{' '}
            <strong className="text-text-primary">Test Your Skills</strong> section on the home screen.
          </p>
          <p>
            Answer five multiple-choice questions in sequence. After you complete all five, the app
            shows your result instantly. Answer everything correctly and claim your reward right
            away — usually <strong className="text-text-primary">150 MB</strong> of free internet per day.
          </p>
        </div>
      </section>

      {/* ── Why People Love It ── */}
      <section id="why-people-love-it" className="my-8">
        <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
          Why People Love the Daily Telenor Quiz?
        </h2>
        <div className="text-sm text-text-secondary leading-relaxed space-y-3">
          <p>
            People enjoy the daily Telenor quiz because it offers real benefits with minimal effort.
            Within minutes, users answer simple multiple-choice questions and earn free internet MBs
            straight to their account.
          </p>
          <ul className="space-y-2 mt-3">
            {[
              'Expands general knowledge with topics like history, geography, and technology',
              'Takes only a few minutes, making it easy to play anytime',
              'Credits rewards instantly after completion',
              'Works on dual SIM phones, even when Telenor is not the primary SIM',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-accent font-bold mt-0.5 flex-shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Who Can Join ── */}
      <section id="who-can-join" className="my-8">
        <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
          Who Can Join the Today Telenor Quiz Answer?
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-3">
          Every Telenor user in Pakistan can join without any restrictions — both prepaid and
          postpaid customers, including dual SIM phone users.
        </p>
        <ul className="space-y-2">
          {[
            ['Prepaid and Postpaid Users', 'Enjoy the quiz as long as the app is installed.'],
            ['Dual SIM Phones', 'Keep another network as your main line and still play with your Telenor SIM.'],
            ['Trivia Lovers and Students', 'Challenge yourself and learn something new every day.'],
          ].map(([label, desc], i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent font-bold mt-0.5 flex-shrink-0">👉</span>
              <span><strong className="text-text-primary">{label}</strong> – {desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Rewards ── */}
      <section id="rewards" className="my-8 bg-surface border border-border rounded-xl p-6">
        <h2 className="font-heading font-bold text-xl text-text-primary mb-3">
          Rewards You Can Get from My Telenor Today Answer
        </h2>
        <p className="text-sm text-text-primary leading-relaxed">
          By participating in My Telenor today answers, you can earn exciting rewards. The main
          prize is <strong className="text-text-primary">150 MB of free data</strong>, giving you extra
          connectivity without spending a penny. Many users also enjoy bonus balance for calls and SMS.
          During special occasions like Ramadan, Eid, or Independence Day, seasonal offers may appear,
          adding even more value.
        </p>
      </section>

      {/* ── Common Problems ── */}
      <section id="common-problems" className="my-8">
        <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
          Common Problems and How to Fix Them
        </h2>
        <div className="space-y-4">
          {[
            {
              title: 'Quiz Not Loading',
              fix: 'Ensure your internet connection is stable. Clear the app cache or update the app to the latest version.',
            },
            {
              title: 'App Lagging',
              fix: 'Restart your phone to refresh the system. If the lag continues, uninstall and reinstall the app.',
            },
            {
              title: 'Reward Not Showing',
              fix: 'Keep your mobile data on and wait 2–5 minutes. If still missing, contact Telenor support at 345.',
            },
          ].map((p, i) => (
            <div key={i} className="border-l-4 border-accent pl-4">
              <p className="font-semibold text-sm text-text-primary">{p.title}</p>
              <p className="text-sm text-text-secondary mt-1">{p.fix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tips ── */}
      <section id="tips" className="my-8">
        <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
          Proven Tips to Boost Your Success
        </h2>
        <ul className="space-y-2">
          {[
            ['Focus on Details', 'Read each question carefully before choosing an answer.'],
            ['Eliminate Wrong Options', 'Narrow down choices to increase accuracy.'],
            ['Learn from Each Attempt', 'Check the correct answer and understand why it matters.'],
            ['Stay Consistent', 'Daily practice builds knowledge and keeps rewards coming.'],
          ].map(([tip, desc], i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent font-bold mt-0.5 flex-shrink-0">✓</span>
              <span><strong className="text-text-primary">{tip}</strong> – {desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Conclusion ── */}
      <section id="conclusion" className="my-8 bg-primary/5 border border-primary/20 rounded-xl p-6">
        <h2 className="font-heading font-bold text-xl text-text-primary mb-3">
          Conclusion
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Telenor Answer today opens more than just a chance to win free internet. It turns everyday
          moments into opportunities to learn, grow, and stay connected without spending extra on your
          mobile balance. Download the My Telenor App today and join thousands of users who enjoy daily
          rewards while expanding their knowledge.{' '}
          <strong className="text-text-primary">Your next 150 MB of free internet waits just five questions away.</strong>
        </p>
        <div className="mt-4 flex gap-3 flex-wrap">
          <a
            href="https://play.google.com/store/apps/details?id=com.telenor.pakistan.mytelenor"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-dark transition-colors"
          >
            📱 Download for Android
          </a>
          <a
            href="https://apps.apple.com/pk/app/my-telenor/id1087721779"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-[#2a5298] transition-colors"
          >
            🍎 Download for iOS
          </a>
        </div>
      </section>
    </div>
  );
}

import TeamMember from './TeamMember';

function About() {
  const teamMembers = [

    { name: 'James Nguyen', title: 'Back-end/Front-end Developer', imageSrc: 'https://info441photoalbum.blob.core.windows.net/images/IMG_39251.jpg' },
    { name: 'Yan Remes', title: 'Back-end/Front-end Developer', imageSrc: 'https://info441photoalbum.blob.core.windows.net/images/Yan_Remes.jpg' },
    { name: 'Sunghee Park', title: 'Back-end/Front-end Developer', imageSrc: 'https://info441photoalbum.blob.core.windows.net/images/IMG_3985.jpg' },
    { name: 'Roberto Raftery', title: 'Back-end/Front-end Developer', imageSrc: 'https://info441photoalbum.blob.core.windows.net/images/photo2-28009e4b-7cd1-4ae2-91ff-26d2f1388308.jpg' }
  ];

  return (
    <div className="about mt-4">
      <header className="about-header">
        <h1>About Us</h1>
        <p>Our mission is to empower young adults to easily organize, share, and connect over their cherished memories through a user-friendly platform, enhancing the sense of community during life's transitions.</p>
      </header>
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <TeamMember key={index} name={member.name} title={member.title} imageSrc={member.imageSrc} />
        ))}
      </div>
    </div>
  );
}

export default About;
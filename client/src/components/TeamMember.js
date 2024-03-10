function TeamMember({ name, title, imageSrc }) {
    return (
      <div className="team-member">
        <img src={imageSrc} alt={name} className="team-member-image" />
        <h3>{name}</h3>
        <p className="title">{title}</p> 
      </div>
    );
  }

  export default TeamMember;
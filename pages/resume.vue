<template>
  <PageCard
    back-button-page="/"
    longform
  >
    <template #title>
      Resume
    </template>
    <template #titleright>
      <LinkButton
        text="PDF"
        title="Download as a PDF"
        href="/Mark-Metcalfe-Resume.pdf"
        large
      >
        <Icon name="fa6-solid:download" />
      </LinkButton>
    </template>
    <ResumeSection title="Experience">
      <ResumeEntry>
        <template #left>
          <p><strong>Senior Developer</strong></p>
          <p><strong><em>Toitū Te Whenua Land Information New Zealand</em></strong></p>
          <p><span>Oct. 2023 – Present</span></p>
        </template>
        <template #right>
          <p>
            I work at Land Information New Zealand as a Senior Digital Specialist - Developer,
            working on government mapping software in the form of multiple back-end and front-end apps.
            In this role, I have:
          </p>
          <ul>
            <ListItem>Developed and maintained features front-end features for our GIS based front-end app using React, TypeScript, Redux, OpenLayers, and other libraries</ListItem>
            <ListItem>Developed REST API endpoints in Kotlin and Java using the Spring Boot framework</ListItem>
            <ListItem>Planned and architected complex new projects and features</ListItem>
            <ListItem>Implemented and upgraded our deployment stack using AWS and Cloud Development Kit (CDK)</ListItem>
            <ListItem>Designed relational database schema and constructed complex SQL</ListItem>
            <ListItem>Written integration, unit and acceptance tests to ensure the correctness and maintainability of our code</ListItem>
            <ListItem>Scaffolded a new project with Kotlin and Spring Boot, using best practices in accordance with the programme’s target state architecture</ListItem>
            <ListItem>Performed in a Scaled Agile Framework (SAFe) environment</ListItem>
            <ListItem>Demonstrated new features to external customers</ListItem>
            <ListItem>Collaborated with external legacy vendors</ListItem>
            <ListItem>Peer reviewed and tested my colleagues’ work</ListItem>
          </ul>
        </template>
      </ResumeEntry>
      <ResumeEntry>
        <template #left>
          <p><strong>Full Stack Developer</strong></p>
          <p><strong><em>Bank of New Zealand</em></strong></p>
          <p><span>Nov. 2021 – Apr. 2023</span></p>
        </template>
        <template #right>
          <p>I worked at BNZ as a full stack software developer for eighteen months, with a focus on front-end development. In this role:</p>
          <ul>
            <ListItem>Developed and maintained features front-end features using React, TypeScript, Redux, and other front end libraries</ListItem>
            <ListItem>Developed REST API endpoints in Java using the Spring Boot framework</ListItem>
            <ListItem>Performed in an Agile environment (both Scrum and Kanban)</ListItem>
            <ListItem>Maintained our team’s Jenkins pipelines</ListItem>
            <ListItem>Oversaw production deployments</ListItem>
            <ListItem>Diagnosed live production defects using Sentry and Splunk</ListItem>
            <ListItem>Ensured our libraries and dependencies remained up to date</ListItem>
            <ListItem>Worked with our Business Analysts and Product Owner to triage security issues and technical debt</ListItem>
            <ListItem>Documented vital team processes</ListItem>
          </ul>
        </template>
      </ResumeEntry>
      <ResumeEntry>
        <template #left>
          <p><strong>Full Stack Developer</strong></p>
          <p><strong><em>Totara Learning Solutions</em></strong></p>
          <p><span>Oct. 2018 – Nov. 2021</span></p>
        </template>
        <template #right>
          <p>I worked for Totara Learning for three years primarily as a backend developer, as well as some front-end work. In this role I:</p>
          <ul>
            <ListItem>Developed object-oriented code in PHP (5.6, 7+, 8+)</ListItem>
            <ListItem>Built front-end views and componentry using Vue.JS and SCSS</ListItem>
            <ListItem>Used MVC and ORM frameworks, and external libraries via Composer</ListItem>
            <ListItem>Wrote GraphQL APIs</ListItem>
            <ListItem>Developed scripts and tools for my fellow developers to increase productivity</ListItem>
            <ListItem>Safeguarded our product and users by auditing for and preventing critical security vulnerabilities</ListItem>
            <ListItem>Deployed and maintained external repositories for our Docker images and Composer libraries</ListItem>
            <ListItem>Helped hire an intern and mentored them over their summer internship</ListItem>
            <ListItem>Wrote technical documentation for other developers in my team and non-technical documentation for end users</ListItem>
          </ul>
        </template>
      </ResumeEntry>
    </ResumeSection>
    <ResumeSection title="Skills">
      <ResumeEntry left="Analytical">
        I can quickly identify technical debt and areas where code can be cleaner,
        crucial for ensuring codebases can scale and be viable in the long-term
      </ResumeEntry>
      <ResumeEntry left="Responsible">
        I take pride in the code I write - I believe developers should be responsible
        for their code and it should always be written to a high standard
      </ResumeEntry>
      <ResumeEntry left="Proactive">
        I am not afraid to ask questions and discover the best solutions for problems.
        If something doesn’t seem quite right, then I make sure that the issue is tracked,
        rather than assuming/expecting someone else to take care of it
      </ResumeEntry>
      <ResumeEntry left="Multi-Tasker">
        I have successfully mentored other developers, which required walking them
        through our development process while simultaneously working on my own tasks
      </ResumeEntry>
      <ResumeEntry left="Team Player">
        Peer review and testing is vital to ensure the team is producing a quality product,
        so giving feedback in a friendly and constructive manner is crucial for
        improving our product quality whilst enhancing team cohesion
      </ResumeEntry>
      <ResumeEntry left="Community-Minded">
        I care about being part of a community and like to help foster this in a workplace environment.
        For instance, I have helped create a large map of all our staff names,
        photos and places of origin to foster a sense of togetherness
      </ResumeEntry>
    </ResumeSection>
    <ResumeSection title="Education">
      <ResumeEntry>
        <template #left>
          <p><strong>Bachelor of Science in Computer Science & History</strong></p>
          <p><strong><em>Victoria University of Wellington</em></strong></p>
          <p><span>2016 – 2018</span></p>
        </template>
        <template #right>
          <p>
            I graduated with a Bachelor of Science, double majoring in Computer Science and History.
            I learned a broad range of skills and competencies, including:
          </p>
          <ul>
            <ListItem>Critical thinking, reasoning, and writing skills with extended historical analyses</ListItem>
            <ListItem>Web and mobile development</ListItem>
            <ListItem>Relational database design and interaction</ListItem>
            <ListItem>Object oriented programming in Java</ListItem>
          </ul>
        </template>
      </ResumeEntry>
    </ResumeSection>
  </PageCard>
</template>

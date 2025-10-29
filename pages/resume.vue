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
        external
      >
        <Icon name="bx:download" />
      </LinkButton>
    </template>
    <ResumeSection title="Experience">
      <ResumeEntry>
        <template #left>
          <p><strong>Totara Learning</strong></p>
          <p><strong><em>Senior Software Engineer</em></strong></p>
          <p><span>Oct. 2024 – Present,<br>Oct. 2018 – Nov. 2021</span></p>
        </template>
        <template #right>
          <p>
            I have worked for Totara Learning for four years in total, with my current role being a senior engineer,
            having started as a graduate engineer seven years ago in 2018. In this role I:
          </p>
          <ul>
            <ListItem>Led my team through completing critical compliance work</ListItem>
            <ListItem>Proactively collaborated with senior engineering leaders to improve department-wide engineering practices</ListItem>
            <ListItem>Led threat modelling sessions with cyber security analysts</ListItem>
            <ListItem>Researched and wrote an architecture whitepaper on agentic AI and how it would fit into the existing product’s technology stack</ListItem>
            <ListItem>Mentored and led junior and intermediate engineers</ListItem>
            <ListItem>Led maintaining the primary local development environment and proactively introduced new tooling to improve developer productivity</ListItem>
            <ListItem>Facilitated technical decision-making using decision registers to reach consensus on development approaches</ListItem>
            <ListItem>Architected and developed object-oriented solutions in PHP</ListItem>
            <ListItem>Built front-end views and componentry using Vue.JS and SCSS</ListItem>
            <ListItem>Developed using modern ORM and MVC architectural practices</ListItem>
            <ListItem>Wrote performant and scalable GraphQL APIs</ListItem>
            <ListItem>Introduced modern DevOps practices into our CI/CD pipelines</ListItem>
          </ul>
        </template>
      </ResumeEntry>
      <ResumeEntry>
        <template #left>
          <p><strong>Toitū Te Whenua Land Information New Zealand</strong></p>
          <p><strong><em>Senior Developer</em></strong></p>
          <p><span>Oct. 2023 – Oct. 2024</span></p>
        </template>
        <template #right>
          <p>
            I worked at Land Information New Zealand as a Senior Full Stack Developer for one year. In this role I:
          </p>
          <ul>
            <ListItem>Developed and maintained features front-end features for our GIS based front-end app using React, TypeScript, Redux, OpenLayers, Cytoscape and other libraries</ListItem>
            <ListItem>Developed REST API endpoints in Kotlin and Java using the Spring Boot framework</ListItem>
            <ListItem>Planned and architected complex new projects and features</ListItem>
            <ListItem>Implemented and upgraded our deployment stack using AWS and Cloud Development Kit (CDK)</ListItem>
            <ListItem>Designed relational database schema and constructed complex SQL</ListItem>
            <ListItem>Wrote integration, unit and acceptance tests to ensure the correctness and maintainability of our code</ListItem>
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
          <p><strong>Bank of New Zealand</strong></p>
          <p><strong><em>Full Stack Developer</em></strong></p>
          <p><span>Nov. 2021 – Apr. 2023</span></p>
        </template>
        <template #right>
          <p>
            I worked at BNZ as a full stack developer for eighteen months, with a focus on front-end development. In this role I:
          </p>
          <ul>
            <ListItem>Developed and maintained features front-end features using React, TypeScript, Redux, and other front end libraries</ListItem>
            <ListItem>Developed REST API endpoints in Java using the Spring Boot framework</ListItem>
            <ListItem>Performed in an Agile environment (both Scrum and Kanban)</ListItem>
            <ListItem>Maintained our team’s Jenkins pipelines</ListItem>
            <ListItem>Oversaw production deployments</ListItem>
            <ListItem>Diagnosed live production defects using Sentry and Splunk</ListItem>
            <ListItem>Worked with our Business Analysts and Product Owner to triage security issues and technical debt</ListItem>
            <ListItem>Documented vital team processes</ListItem>
          </ul>
        </template>
      </ResumeEntry>
    </ResumeSection>
    <ResumeSection title="Skills">
      <ResumeEntry left="Solution Architecture">
        I can plan and develop complex features, evaluate technical options, and contribute to architectural
        decisions across multiple tech stacks
      </ResumeEntry>
      <ResumeEntry left="Software Design &amp; Development">
        I have designed and developed object-oriented solutions, built scalable APIs, and created front-end
        components using modern frameworks and best practices
      </ResumeEntry>
      <ResumeEntry left="Methods &amp; Tools">
        I have introduced modern DevOps practices, maintained CI/CD pipelines, and implemented tooling
        to improve developer productivity
      </ResumeEntry>
      <ResumeEntry left="Professional Development &amp; Mentorship">
        I have mentored junior and intermediate engineers, facilitated technical decision-making, and built
        team capability through knowledge sharing
      </ResumeEntry>
      <ResumeEntry left="Analytical &amp; Proactive">
        I identify areas for improvement - including technical debt - and ensure issues are tracked and addressed
        rather than left for others to resolve
      </ResumeEntry>
      <ResumeEntry left="Team Player">
        I provide constructive peer review and testing feedback to improve quality and maintain high standards
        while recognising my team members’ efforts
      </ResumeEntry>
    </ResumeSection>
    <ResumeSection title="Education">
      <ResumeEntry>
        <template #left>
          <p><strong>Victoria University of Wellington</strong></p>
          <p><strong>Bachelor of Science<br>Computer Science, History</strong></p>
          <p><span>2016 – 2018</span></p>
        </template>
        <template #right>
          <p>
            I graduated with a Bachelor of Science, double majoring in Computer Science and History. I learned
            a broad range of skills and competencies, including:
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

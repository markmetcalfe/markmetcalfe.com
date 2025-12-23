<template>
  <PageCard
    back-button-page="/"
  >
    <template #title>
      Interests
    </template>
    <SectionBlock
      title="Visual Art"
    >
      <LinkButton
        text="Instagram"
        href="https://www.instagram.com/_vizshun/"
        large
        external
      >
        <Icon name="simple-icons:instagram" />
      </LinkButton>
    </SectionBlock>
    <SectionBlock title="DJing">
      <LinkButton
        text="Soundcloud"
        href="https://soundcloud.com/vizshun"
        large
        external
      >
        <Icon name="simple-icons:soundcloud" />
      </LinkButton>
    </SectionBlock>
    <SectionBlock title="Gaming">
      <LinkButton
        text="Minecraft Server"
        href="/minecraft"
        large
      >
        <Icon name="mdi:minecraft" />
      </LinkButton>
    </SectionBlock>
    <SectionBlock title="Recently Played">
      <RecentlyPlayed />
    </SectionBlock>
  </pagecard>
</template>

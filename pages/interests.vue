<template>
  <PageCard
    back-button-page="/"
  >
    <template #title>
      Interests
    </template>
    <SectionBlock title="DJing">
      <LinkButton
        text="Soundcloud"
        href="https://soundcloud.com/oh-high-mark"
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

<template>
  <span class="loadingspinner-container">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        class="loadingspinner"
        opacity=".25"
      />
      <path
        d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
        class="loadingspinner loadingspinner-animated"
      />
    </svg>
  </span>
</template>

<style lang="scss">
.loadingspinner-container {
  transform: scale(2.5);
  display: inline-block;
  padding: 1rem;
}

.loadingspinner {
  fill: var(--color-light);
}

.loadingspinner-animated {
  transform-origin: center;
  animation: loadingspinneranimation 0.75s infinite linear;
}

@keyframes loadingspinneranimation {
  100% {
    transform: rotate(360deg);
  }
}
</style>

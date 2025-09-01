<template>
  <router-link to="/">
    <img class = "logo" src = "/logo.png"  background-color = transparent >
  </router-link>
</template>

<style scoped>
.logo {
  font-size: 1.4rem;
  font-weight: bold;
  max-width: 100%;
  transition: all 0.3s ease;
  object-fit: contain;
}


/* Responsive Design */
@media (min-width: 768px) {
  .logo {
    max-height: 160px;
  }
}

@media (min-width: 1024px) {
  .logo {
    max-height: 170px;
  }
}

@media (min-width: 1280px) {
  .logo {
    max-height: 200px;
  }
}

@media (min-width: 1536px) {
  .logo {
    max-height: 220px;
  }
}

@media (max-width: 767px) {
  .logo {
    max-height: 120px;
  }
}

@media (max-width: 480px) {
  .logo {
    max-height: 80px;
  }
}
</style>
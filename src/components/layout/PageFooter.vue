<template>
  <footer class="footer" role = "contentinfo">
    <div class="footer-top">
<!-- Logo was here -->
      <div class="footer-columns">
        <div class="column">
          <h4>Правовая информация</h4>
          <ul>
            <li><a href="/terms">Пользовательское соглашение</a></li>
            <li><a href="/privacy">Политика конфиденциальности</a></li>
            <li><a href="/data-policy">Обработка данных</a></li>
          </ul>
        </div>

        <div class="column">
          <h4>О проекте</h4>
          <ul>
            <li><a href="/about">О Traveltis</a></li>
            <li><a href="/contact">Контакты</a></li>
          </ul>
        </div>

        <div class="column">
          <h4>Поддержка</h4>
          <ul>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/support">Служба поддержки</a></li>
          </ul>
        </div>
      </div>
      <img src="/logo.jpeg" alt="Traveltis Logo" class="logo" />
    </div>

    <div class="footer-bottom">
      <p>© 2025 Traveltis. Все права защищены.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(135deg, #121821, #1f2937, #3b4759);
  color: #f9fafb;
  padding: 1rem 1rem;
  font-size: 0.9rem;
  border-top: 4px solid #f59e0b;
}

.footer-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  width: 18%;
  height: auto;
  background-color: rgba(255, 255, 255, 0.34); 
  border-radius: 12px;
}

.footer-columns {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  text-align: center;
}

.column h4 {
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: #fbbf24;
}

.column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.column li {
  margin-bottom: 0.1rem;
}

.column a {
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.3s ease;
  position:relative;
}

.column a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0%;
  height: 1px;
  background-color: #fbbf24;
  transition: width 0.3s ease;
}

.column a:hover::after {
  width: 100%;
}

.column a:hover {
  color: #ffffff;
  text-decoration: underline;
}

.footer-bottom {
  text-align: center;
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.5rem;
  border-top: 1px solid #374151;
  padding-top: 0.5rem;
}

@media (min-width: 768px) {
  .footer-top {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }

  .footer-columns {
    justify-content: flex-end;
    text-align: left;
  }

  .logo {
    margin-right: 2rem;
  }
}
</style>

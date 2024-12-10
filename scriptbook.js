// Array globale per memorizzare gli articoli nel carrello
let cart = 0;
const url = "https://striveschool-api.herokuapp.com/books"

document.addEventListener('DOMContentLoaded', function() {
    initializeUI(); // Gestisce il popolamento di informazioni del negozio
    fetchBooks(); // Caricamento della griglia prodotti
    initializeEvents(); // Inizializzazione eventi al click (apertura carrello)
});

function initializeUI() {
    // Imposta il nome e l'indirizzo del negozio nell'interfaccia
    document.getElementById('nomeNegozio').textContent = negozio.nomeNegozio;
    document.getElementById('indirizzoNegozio').textContent = negozio.indirizzo;
    
    // Crea dinamicamente la lista dei metodi di pagamento
    // Docs: https://developer.mozilla.org/it/docs/Web/API/Document/createElement
    const metodiPagamentoList = document.getElementById('metodiPagamento');
    for (let i = 0; i < negozio.metodiPagamento.length; i++) {
        const li = document.createElement('li');
        li.textContent = negozio.metodiPagamento[i];
        metodiPagamentoList.appendChild(li);
    }

    // Mostra le informazioni sulla spedizione usando template literals
    // Docs: https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Template_literals
    document.getElementById('infoSpedizione').textContent = 
        `Spese di spedizione: €${negozio.speseSpedizione}\nSpedizione gratuita per ordini superiori a €${negozio.sogliaSpedizioneGratuita}`;
}

function initializeEvents() {
    // Evento click sul pulsante del carrello
    document.querySelector('.btn-outline-dark').addEventListener('click', function() {
        const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        cartModal.show();
    });
}

const fetchBooks = () => {
    fetch(url)
      .then((raw) => raw.json())
      .then((res) => {
  
        let log = res
        console.log(log);
        
        let cont = document.querySelector("#productContainer")
  
        cont.innerHTML = res
          .map((book) => {
            return ` <div class='col col-3'> <div class="card mb-4 shadow-sm" id='book_${book.asin}'>
                  <img src='${book.img}' alt='${book.title}' />
                  <div class="card-body">
                    <h5 class="card-title text-truncate">${book.title}</h5>
                    <p class="card-text">
                        <strong class="text-danger ms-2">€${book.price.toFixed(2)}</strong>
                        <span class="badge bg-danger text-uppercase ms-2">${book.category}</span>
                        <span class="ms-2">ASIN:${book.asin}</span>
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                      <button class='btn btn-primary' onclick="addToCart('${book.title}', '${book.price}', '${book.asin}')"><i class="fas fa-cart-plus"></i></button>
                    </div>
                  </div>
                </div> </div>`
          })
          .join("")
      })
      .catch((err) => console.error(err))
  }

  const addToCart = (title, price, asin) => {
    const book = document.querySelector("#book_" + asin)
    book.style.border = "2px solid red";
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    cartItems.innerHTML += `
        <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h6>${title}</h6>
                    <small>€${price}</small>
                </div>
                <div>
                    <span class="me-3">€${price}</span>
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart('${asin}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
    `;
    cartTotal.innerText = (Number(cartTotal.innerText) + Number(price)).toFixed(2);
    showCartNotification(title); // Mostra una notifica "toast"
    updateCartBadge(); // Aggiorna il badge del carrello
}

function showCartNotification(productTitle) {
    // Crea e mostra un toast Bootstrap temporaneo
    // Usa setTimeout per rimuovere il toast dopo 3 secondi
    // Docs: https://developer.mozilla.org/it/docs/Web/API/setTimeout
    
    const existingToast = document.querySelector('.toast');
    if (existingToast) { // Rimuovi toast precedenti (se presenti)
        existingToast.remove();
    }

    // Crea nuovo toast usando template literals (il toast è un elemento Bootstrap di notifica, la vedete in basso a destra quando aggiungete un prodotto al carrello)
    const toastHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Carrello aggiornato</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${productTitle} è stato aggiunto al carrello
            </div>
        </div>
    `;

    // Inserisci il toast nel DOM
    document.body.insertAdjacentHTML('beforeend', toastHTML);

    // Rimuovi il toast dopo 3 secondi
    setTimeout(() => {
        const toast = document.querySelector('.toast');
        if (toast) {
            toast.remove();
        }
    }, 3000);
}

function updateCartBadge() {
    const badge = document.querySelector('.badge');
    badge.textContent = (Number(badge.innerText) + 1);
}

const searchBook = (ev) => {
    let query = ev.target.value
    let allTitles = document.querySelectorAll(".card-title")
    console.log(
      query,
      allTitles[0].innerText.toLowerCase().includes(query.toLowerCase())
    )
    allTitles.forEach((title) => {
      const currCard = title.parentElement.parentElement.parentElement
      if (!title.innerText.toLowerCase().includes(query.toLowerCase())) {
        currCard.style.display = "none"
      } else {
        currCard.style.display = "block"
      }
    })
  }

function removeFromCart(asin) {
    const itemToRemove = document.querySelector(`button[onclick="removeFromCart('${asin}')"]`)
        .closest('.d-flex');
    const price = itemToRemove.querySelector('small').innerText.replace('€', '');
    
    // Aggiorna il totale
    const cartTotal = document.getElementById('cartTotal');
    cartTotal.innerText = (Number(cartTotal.innerText) - Number(price)).toFixed(2);
    
    // Rimuovi l'elemento dal carrello
    itemToRemove.remove();
    
    // Rimuovi il bordo rosso dal libro
    const book = document.querySelector("#book_" + asin);
    if (book) {
        book.style.border = "none";
    }
    
    // Aggiorna il badge del carrello
    const badge = document.querySelector('.badge');
    badge.textContent = (Number(badge.innerText) - 1);
}
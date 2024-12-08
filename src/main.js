import { fetchImages } from './js/pixabay-api.js';
import { clearGallery, renderImages } from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreButton = document.querySelector('.load-more'); 

let query = '';
let page = 1;
let lightbox;

form.addEventListener('submit', function (event) {
  event.preventDefault();

  query = form.elements.searchQuery.value.trim();
  if (!query) {
    iziToast.error({ title: 'Error', message: 'Please enter a search query!' });
    return;
  }

  page = 1;
  clearGallery(gallery);
  loadMoreButton.classList.add('is-hidden'); 
  loader.classList.remove('is-hidden');

  fetchImages(query, page)
    .then(function (response) {
      loader.classList.add('is-hidden');
      if (response.hits.length === 0) {
        iziToast.warning({ title: 'No results', message: 'Sorry, no images found!' });
        return;
      }
      renderImages(response.hits, gallery);
      lightbox = new SimpleLightbox('.gallery a');
      lightbox.refresh();
      if (response.totalHits > page * 15) {
        loadMoreButton.classList.remove('is-hidden');
      } else {
        loadMoreButton.classList.add('is-hidden');
        iziToast.info({ title: 'End of results', message: "You've reached the end of the search results." });
      }
    })
    .catch(function (error) {
      iziToast.error({ title: 'Error', message: error.message });
      loader.classList.add('is-hidden');
      loadMoreButton.classList.add('is-hidden');
    });
});

loadMoreButton.addEventListener('click', function () {
  page += 1;
  loader.classList.remove('is-hidden');
  fetchImages(query, page)
    .then(function (response) {
      loader.classList.add('is-hidden');
      if (response.hits.length === 0) {
        iziToast.warning({ title: 'No more results', message: 'Sorry, no more images found!' });
        loadMoreButton.classList.add('is-hidden');
        return;
      }
      renderImages(response.hits, gallery);
      lightbox.refresh();

      const galleryItems = document.querySelectorAll('.gallery__item');
      const cardHeight = galleryItems[0].getBoundingClientRect().height;
      window.scrollBy(0, cardHeight * 2);

      
      if (response.totalHits > page * 15) {
        loadMoreButton.classList.remove('is-hidden');
      } else {
        loadMoreButton.classList.add('is-hidden');
        iziToast.info({ title: 'End of results', message: "You've reached the end of the search results." });
      }
    })
    .catch(function (error) {
      iziToast.error({ title: 'Error', message: error.message });
      loader.classList.add('is-hidden');
      loadMoreButton.classList.add('is-hidden'); 
    });
});
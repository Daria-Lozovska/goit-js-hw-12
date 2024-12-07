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
let totalHits = 0;
let lightbox;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  query = event.target.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.error({ title: 'Error', message: 'Please enter a search query!' });
    return;
  }

  page = 1; 
  clearGallery(gallery);
  loader.classList.remove('is-hidden');
  loadMoreButton.classList.add('is-hidden');

  try {
    const data = await fetchImages(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.warning({ title: 'No results', message: 'No images found!' });
      loader.classList.add('is-hidden');
      return;
    }

    renderImages(data.hits, gallery);
    lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();

    loader.classList.add('is-hidden');
    loadMoreButton.classList.toggle('is-hidden', data.hits.length >= totalHits);
  } catch (error) {
    iziToast.error({ title: 'Error', message: error.message });
    loader.classList.add('is-hidden');
  }
});

loadMoreButton.addEventListener('click', async () => {
  page += 1;
  loader.classList.remove('is-hidden');
  loadMoreButton.classList.add('is-hidden');

  try {
    const data = await fetchImages(query, page);
    renderImages(data.hits, gallery);
    lightbox.refresh();

    if (page * 15 >= totalHits) {
      iziToast.info({ title: 'End of results', message: "You've reached the end of the search results." });
      loadMoreButton.classList.add('is-hidden');
    } else {
      loadMoreButton.classList.remove('is-hidden');
    }

    const cardHeight = gallery.querySelector('.photo-card').getBoundingClientRect().height;
    window.scrollBy({
      top: cardHeight * 2, 
      behavior: 'smooth',
    });
  } catch (error) {
    iziToast.error({ title: 'Error', message: error.message });
  } finally {
    loader.classList.add('is-hidden');
  }
});
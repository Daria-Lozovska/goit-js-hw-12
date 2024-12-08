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
  query = form.elements.searchQuery.value.trim();
  if (!query) {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter something into the search field!',
      position: 'topRight',
      timeout: 3000,
    });
    return;
  }

  page = 1;
  clearGallery(gallery);
  toggleLoader(true);

  try {
    const data = await fetchImages(query, page);
    toggleLoader(false);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.warning({ title: 'No results', message: 'Sorry, no images found!' });
      return;
    }

    iziToast.info({ title: 'Results', message: `Found ${totalHits} images.` });
    renderImages(data.hits, gallery);
    lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();

    toggleLoadMoreButton(totalHits > page * 15);
  } catch (error) {
    toggleLoader(false);
    iziToast.error({ title: 'Error', message: error.message });
  }
});

loadMoreButton.addEventListener('click', async () => {
  page += 1;
  toggleLoader(true);

  try {
    const data = await fetchImages(query, page);
    toggleLoader(false);

    renderImages(data.hits, gallery);
    lightbox.refresh();

    if (page * 15 >= totalHits) {
      iziToast.info({ title: 'End', message: "You've reached the end of search results." });
      toggleLoadMoreButton(false);
    }
  } catch (error) {
    toggleLoader(false);
    iziToast.error({ title: 'Error', message: error.message });
  }
});

function toggleLoader(isVisible) {
  loader.textContent = isVisible ? 'Loading...' : '';
  loader.classList.toggle('is-hidden', !isVisible);
}

function toggleLoadMoreButton(isVisible) {
  loadMoreButton.classList.toggle('is-hidden', !isVisible);
}
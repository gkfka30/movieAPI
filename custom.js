let movieBoard = document.querySelector("#movieBoard");
// loadMoreBtn은 HTML에서 <button id="loadMoreBtn">더보기</button>로 선언되어야 합니다.
let loadMoreBtn = document.querySelector("#loadMoreBtn");
let apikey = "bc71d3abd625181bc3d75909bc79acec";

// --- 1. 전역 상태 관리 변수 ---
let currentPage = 1; // 현재 페이지 번호
let currentListType = "now_playing"; // 현재 보여주고 있는 목록의 타입 ('now_playing', 'popular', 'search' 등)
let currentSearchKeyword = ""; // 현재 검색 키워드

// --- 2. 영화 목록 불러오기 함수 (페이지네이션 및 목록 타입 지원) ---
// lists: 목록 타입 ('now_playing', 'popular' 등) 또는 'search'
// page: 불러올 페이지 번호
// keyword: 검색 시 필요한 키워드
let movie = async (lists, page, keyword = "") => {
  let url = "";

  if (lists === "search") {
    // 검색 API URL
    url = `https://api.themoviedb.org/3/search/movie?query=${keyword}&page=${page}&api_key=${apikey}&language=ko-KR`;
  } else {
    // 일반 목록 API URL
    url = `https://api.themoviedb.org/3/movie/${lists}?page=${page}&api_key=${apikey}&language=ko-KR`;
  }

  try {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = await response.json();
    // console.log(data);

    let movieList = data.results;
    let totalPages = data.total_pages;

    // 불러온 목록을 화면에 렌더링
    render(movieList, page);

    // 더 이상 페이지가 없거나 결과가 없으면 '더보기' 버튼을 숨깁니다.
    if (loadMoreBtn) {
      if (page >= totalPages || movieList.length === 0) {
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "block";
      }
    }
  } catch (error) {
    console.error("영화 데이터를 가져오는 중 오류 발생:", error);
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
  }
};

// --- 3. 렌더링 함수 (페이지에 따라 목록을 추가하거나 초기화) ---
let render = (movieList, page) => {
  // 첫 페이지 (1)를 불러올 때만 내용을 비웁니다.
  if (page === 1) {
    movieBoard.innerHTML = "";
  }

  movieList.forEach((movie) => {
    // 포스터 경로 처리
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
      : "https://via.placeholder.com/500x750?text=Poster+Not+Available";

    let card = `
      <div class="card">
        <div class="poster-container">
          <img src="${posterUrl}" alt="${movie.title} 포스터">
          <div class="overlay">
            <p class="overlay-overview">${
              movie.overview || "줄거리 정보 없음"
            }</p>
            
            <h3 class="overlay-title">${movie.title}</h3>

            <h4 class="overlay-rating">평점: ${movie.vote_average.toFixed(
              1
            )}</h4>
            
          </div>
        </div>
      </div>`;

    movieBoard.innerHTML += card;
  });
};

// --- 4. 메뉴 버튼 클릭 핸들러 (HTML 'onclick'에서 호출됨) ---
/**
 * @param {string} listType - TMDB API의 목록 타입 ('now_playing', 'popular', 'top_rated', 'upcoming')
 */
const handleListButtonClick = (listType) => {
  // 상태 초기화 및 업데이트
  currentPage = 1; // 새 목록을 불러오므로 페이지는 1로 초기화
  currentListType = listType; // 목록 타입 변경
  currentSearchKeyword = ""; // 검색 키워드 초기화

  // 해당 목록의 1페이지를 로드
  movie(currentListType, currentPage);
};

// --- HTML onclick 속성에서 호출될 수 있도록 함수 이름을 변경하지 않음 ---
// 사용자님의 HTML에 맞춰 함수 이름을 'movie' 대신 'handleListButtonClick'으로 사용하는 것이 더 명확하지만,
// 기존 HTML 코드와의 호환성을 위해 아래와 같이 'movie' 함수를 덮어쓰거나 (또는 기존 'movie' 함수 대신) 사용할 수 있습니다.
// 여기서는 'movie' 함수와 충돌을 피하기 위해 'handleListButtonClick'을 사용했습니다.
// **주의:** HTML의 onclick="movie('...')" 부분을 onclick="handleListButtonClick('...')"로 변경해야 합니다.

// --- 5. 검색 기능 ---
let searchInput = document.querySelector("#searchInput");
let searchBtn = document.querySelector("#searchBtn");

searchBtn.addEventListener("click", async () => {
  let keyword = searchInput.value.trim();

  if (keyword === "") {
    alert("검색어를 입력하세요~");
    return;
  }

  // 검색 시, 모든 상태를 초기화하고 검색 모드로 전환
  currentPage = 1;
  currentListType = "search";
  currentSearchKeyword = keyword;

  // 검색 결과 1페이지 로드
  movie(currentListType, currentPage, currentSearchKeyword);
});

// --- 6. '더보기' 버튼 기능 구현 ---
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    // 현재 페이지 번호를 1 증가
    currentPage++;

    // 현재 목록 타입과 키워드를 사용하여 다음 페이지를 로드
    if (currentListType === "search") {
      movie(currentListType, currentPage, currentSearchKeyword);
    } else {
      movie(currentListType, currentPage);
    }
  });
}

// --- 7. 최초 로드 ---
// 최초 실행: 현재 상영작 1페이지 불러오기 (초기값 'now_playing' 사용)
movie(currentListType, currentPage);

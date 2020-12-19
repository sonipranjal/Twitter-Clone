const URL = "http://localhost:3000/tweets";

let nextPageData = {
  loading: false,
  url: null,
};

const onEnter = (e) => {
  if (e.key == "Enter") {
    getTwitterData();
  }
};

const onNextPage = () => {
  if (nextPageData.url) {
    getTwitterData(true);
  }
};

/**
 * Retrive Twitter Data from API
 */
const getTwitterData = (nextPage = false) => {
  const query = document.getElementById("user-search-input").value;
  if (!query) return;
  const encodedQuery = encodeURIComponent(query);
  let fullurl = `${URL}?q=${encodedQuery}&count=10`;
  if (nextPage) {
    fullurl = nextPageData.url;
    nextPageData.loading = true;
  }
  fetch(fullurl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      saveNextPage(data.search_metadata);
      buildTweets(data.statuses, nextPage);
      nextPageButtonVisibility(data.search_metadata);
    });
};

/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
  nextPageData.url = `${URL}${metadata.next_results}`;
  nextPageData.loading = false;
};

/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (e) => {
  document.getElementById("user-search-input").value = e.innerText;
  getTwitterData();
};

/**
 * Set the visibility of next page based on if there is data on next page
 */
const nextPageButtonVisibility = (metadata) => {
  if (metadata.next_results) {
    document.getElementById("next-page").style.visibility = "visible";
  }
};

/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweets, nextPage) => {
  // console.log(tweets);
  let twitterContent = "";
  tweets.map((tweet) => {
    twitterContent += `
    <div class="tweet-container">
      <div class="tweet-user-info">
        <div class="tweet-user-profile" style="background-image:url(${tweet.user.profile_image_url_https})"></div>
          <div class="tweet-user-name-container">
           <div class="tweet-user-fullname">${tweet.user.name}</div>
           <div class="tweet-user-username">${tweet.user.screen_name}</div>
         </div>
      </div>
      `;
    if (tweet.extended_entities && tweet.extended_entities.media.length > 0) {
      twitterContent += buildImages(tweet.extended_entities.media);
      twitterContent += buildVideo(tweet.extended_entities.media);
    }
    twitterContent += `
    <div class="tweet-text-container">${tweet.full_text}</div>
      <div class="tweet-date">${moment(tweet.created_at).fromNow()}</div>
    </div>
    </div>
  `;
  });

  if (nextPage) {
    document
      .querySelector(".tweets-list")
      .insertAdjacentHTML("beforeend", twitterContent);
  } else {
    document.querySelector(".tweets-list").innerHTML = twitterContent;
  }
};

/**
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
  let imagesContent = `<div class="tweet-images-container">`;
  let imgExists = false;
  mediaList.map((media) => {
    if (media.type == "photo") {
      imgExists = true;
      imagesContent += ` <div class="tweet-image" style="background-image: url(${media.media_url_https})"></div>`;
    }
  });
  imagesContent += `</div>`;
  return imgExists ? imagesContent : "";
};

/**
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
  let videoContent = `<div class="tweet-video-container">`;
  let videoExists = false;
  mediaList.map((media) => {
    if (media.type == "video" || media.type == "animated_gif") {
      videoExists = true;
      const video = media.video_info.variants.find(
        (video) => video.content_type == "video/mp4"
      );
      const videoOptions = getVideoOptions(media.type);
      videoContent += ` 
              <video ${videoOptions}>
                <source src="${video.url}" type="video/mp4">
                Your browser does not support HTML5 video.
              </video>
      `;
    }
  });
  videoContent += `</div>`;
  return videoExists ? videoContent : "";
};

const getVideoOptions = (type) => {
  if (type == "animated_gif") {
    return "loop autoplay";
  } else if (type == "video") {
    return "controls";
  }
};

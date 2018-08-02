var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if(defferredPromptEvent){
    defferredPromptEvent.prompt();
    defferredPromptEvent.userChoice.then(choiceResult=>{
      console.log(choiceResult.outcome);
      if(choiceResult.outcome=== 'dismissed'){
        console.log('user dismissed install prompt');
      }else{
        console.log('user accepted install prompt');
        
      }
    });
    defferredPromptEvent = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

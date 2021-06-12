const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const code = urlParams.get('code');


async function loadPage(){
    try{
        const authorization_response = await post_data((api_url + 'authorize'), {code: code});

        if(authorization_response.status != 200){
            throw "An unexpected error occurred while fulfilling your request. Please try again.";
        }

        const token = (await authorization_response.json()).token;

        setCookie(token, "session", 7);
        window.location.href = "dashboard.html";
    }
    catch(error){
        loader.style.display = "none";
        showError(error);
    }
}

loadPage();


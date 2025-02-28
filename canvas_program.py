#import requests
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

import os
import glob
import shutil
from pathlib import Path


def login_with_session_cookies(username, password, url):
  
    webdriver_path = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

#    Create a new instance of the browser
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('executable_path=' + webdriver_path)

# Create a new instance of the browser
    driver = webdriver.Chrome(options=chrome_options)

    #Navigate to url
    #url = 'https://canvas.charlotte.edu/'
    driver.get('https://canvas.charlotte.edu/')
    
    try:
        #Click NinerNET Login button
        button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[title="NinerNET Canvas Login "]'))
    )
        button.click()

        #Wait until login form appears
        login_form = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'shibboleth-login-form'))
    )

        #Find the username and password textbox
        username_input = login_form.find_element(By.ID, 'username')
        password_input = login_form.find_element(By.ID, 'password')

        #Enter the username and password into the text boxes
        username_input.send_keys(username)
        password_input.send_keys(password)

        #Find and press the login button
        login_button = login_form.find_element(By.XPATH, '//button[contains(text(), "Log In")]')
        login_button.click()


        #Duo page apears here


        #Click button to trust device on duo page
        button = WebDriverWait(driver, 100).until(
            EC.element_to_be_clickable((By.ID, 'trust-browser-button'))
    )
        button.click()

        #IDK but it breaks without it
        #But fr this waits for the canvas dashboard to load before continuing because trying to continue right after clicking the trust button on duo will make you sign in again
        WebDriverWait(driver,100).until(
           EC.presence_of_element_located((By.ID, 'flash_screenreader_holder'))
       )

        #For now we are just scraping the dashboard
        #Navigate to the page or quiz you want to scrape
        target_page_url = url
        driver.get(target_page_url)
        #Page html becomes the html from the target page
        page_html = driver.page_source

        #Create a file from the scraped html
        with open('output_page.html', 'w', encoding='utf-8') as file:
            file.write(page_html)

    except :
        print('error in python')





# username = input("Ender your NinerNET username: ")
# password = input("Enter your NinerNET password: ")

# username = sys.argv[1]
# password = sys.argv[2]
# url = sys.argv[3]
# login_with_session_cookies(username, password, url)


def get_latest_download():
    # Get the user's downloads folder dynamically
    downloads_path = Path.home() / "Downloads"
    
    # Get list of all files in downloads folder sorted by modification time
    files = sorted(glob.glob(str(downloads_path / "*")), key=os.path.getmtime, reverse=True)
    
    # Return the most recent file if there are any
    return files[0] if files else None

def copy_file_to_script_directory(file_path, new_name):
    script_directory = Path.cwd()
    destination = script_directory / new_name
    shutil.copy(file_path, destination)
    print(f"File copied to: {destination}")

if __name__ == "__main__":
    latest_file = get_latest_download()
    if latest_file:
        print(f"Most recently downloaded file: {latest_file}")
        copy_file_to_script_directory(latest_file, "output_page.html")
    else:
        print("No files found in the Downloads folder.")


from selenium import webdriver

class Driver(webdriver.Chrome):
    login_url = 'https://usa.tycoononline.com/frame_index.php?page=login'
    sweden_login_url = 'https://tycoononline.nu/frame_index.php?page=login'

    def __init__(self):
        self.chrome_options = webdriver.ChromeOptions()
        self.chrome_options.add_argument(user_agent_arg)
        self.chrome_options.add_argument(r'user-data-dir=User Data')
        super().__init__(options=self.chrome_options)

    def login(self, username, password):
        self.get(self.login_url)
        self.find_element_by_name("userName").send_keys(username)
        self.find_element_by_name("password").send_keys(password)
        self.find_element_by_class_name("submitknapp").click()

    def login_sweden(self, username, password):
        self.get(self.sweden_login_url)
        self.find_element_by_name("userName").send_keys(username)
        self.find_element_by_name("password").send_keys(password)
        self.find_element_by_class_name("submitknapp").click()
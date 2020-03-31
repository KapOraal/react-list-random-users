import React, { Component, Fragment } from "react";
import request from "superagent";
import debounce from "lodash.debounce";
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: false,
            hasMore: true,
            isLoading: false,
            users: [],
        };

        // Binds our scroll event handler
        window.onscroll = debounce(() => {
            const {
                loadUsers,
                state: {
                    error,
                    isLoading,
                    hasMore,
                },
            } = this;

            const d = document.documentElement;
            const offset = d.scrollTop + window.innerHeight;
            const height = d.offsetHeight;

            // Bails early if:
            // * there's an error
            // * it's already loading
            // * there's nothing left to load
            if (error || isLoading || !hasMore) return;

            // Checks that the page has scrolled to the bottom
            if (height >= offset) {
                loadUsers();
            }
        }, 100);
    }

    componentWillMount() {
        // Loads some users on initial load
        this.loadUsers();
    }

    loadUsers = () => {
        this.setState({ isLoading: true }, () => {
            request
                .get('https://randomuser.me/api/?results=10')
                .then((results) => {

                    // let sortedUsers;

                    // if (this.state.alphabetical === "az") {
                    //     console.log("sort");
                    //     sortedUsers = results.body.results.sort((a, b) =>
                    //         a.name.first > b.name.first ? 1 : -1
                    //     );
                    // } else {
                    //     sortedUsers = results.body.results.sort((a, b) =>
                    //         a.name.first < b.name.first ? 1 : -1
                    //     );
                    // }

                    // console.log(sortedUsers);

                    const nextUsers = results.body.results.map(user => ({
                        email: user.email,
                        name: Object.values(user.name).join(' '),
                        photo: user.picture.medium,
                        username: user.login.username,
                        uuid: user.login.uuid,
                    }));

                    this.setState({
                        hasMore: (this.state.users.length < 100),
                        isLoading: false,
                        users: [
                            ...this.state.users,
                            ...nextUsers,
                        ],
                    });
                })
                .catch((err) => {
                    this.setState({
                        error: err.message,
                        isLoading: false,
                    });
                })
        });
    }

    render() {
        const {
            error,
            hasMore,
            isLoading,
            users,
        } = this.state;

        return (
            <div className="user-container">
                <h1>React Random Users List!</h1>
                <p>Scroll down to load more!!</p>
                {users.map(user => (
                    <Fragment key={user.username}>
                        <hr />
                        <div style={{ display: 'flex' }}>
                            <img
                                alt={user.username}
                                src={user.photo}
                                style={{
                                    borderRadius: '50%',
                                    height: 72,
                                    marginRight: 20,
                                    width: 72,
                                }}
                            />
                            <div>
                                <h2 style={{ marginTop: 0 }}>
                                    @{user.username}
                                </h2>
                                <p>Name: {user.name}</p>
                                <p>Email: {user.email}</p>
                            </div>
                        </div>
                        <hr />
                    </Fragment>
                ))}
                {error &&
                    <div style={{ color: '#900' }}>
                        {error}
                    </div>
                }
                {isLoading &&
                    <div>Loading...</div>
                }
                {!hasMore &&
                    <div>You did it! You reached the end!</div>
                }
            </div>
        );
    }
}

export default App;

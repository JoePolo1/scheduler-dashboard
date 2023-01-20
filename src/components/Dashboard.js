import React, { Component } from "react";
import Loading from "./Loading";
import axios from "axios";

import classnames from "classnames";
import Panel from "./Panel";

import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay
} from "helpers/selectors";

import { setInterview } from "helpers/reducers";

const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay
  }
];

class Dashboard extends Component {
  state = {
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {}
  };

  // Checks if component did mount and applies previous state from LOCAL STORAGE in user's browser
  componentDidMount() {
    const focused = JSON.parse(localStorage.getItem("focused"));

    if (focused)  {
      this.setState({ focused});
    }

    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers"),
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });


    // Creates the socket
    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL)
    // Adds the event listener for the socket
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
    
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };

  }

  

  // Sets USER BROWSER LOCAL STORAGE if a component updated.
  componentDidUpdate(previousProps, previousState)  {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }
  

  /* Instance Method */
  selectPanel(id) {
    /** Sets the focused state to the ID of the clicked panel, enlarging it, unless the previous state was a clicked panel in which it returns to four panel view (null state) */
    this.setState(previousState => ({
      focused: previousState.focused !== null ? null : id
    }));
  }


  render() {

    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
    });

    if (this.state.loading) {
      return <Loading />;
    }

    const panels = (this.state.focused ? data.filter(panel => this.state.focused === panel.id) : data)
      .map(panel => (
        <Panel
          key={panel.id}
          id={panel.id}
          label={panel.label}
          value={panel.getValue(this.state)}
          onSelect={event => this.selectPanel(panel.id)}
        />
      ));

    return <main className={dashboardClasses}>{panels}</main>;
  }

  componentWillUnmount() {
    this.socket.close();
  }

}

export default Dashboard;

import React, { Component } from "react";
import Loading from "./Loading";

import classnames from "classnames";
import Panel from "./Panel";

const data = [
  {
    id: 1,
    label: "Total Interviews",
    value: 6
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    value: "1pm"
  },
  {
    id: 3,
    label: "Most Popular Day",
    value: "Wednesday"
  },
  {
    id: 4,
    label: "Interviews Per Day",
    value: "2.3"
  }
];

class Dashboard extends Component {
  state = {
    loading: false,
    focused: null
  };

  // Checks if component did mount and applies previous state from LOCAL STORAGE in user's browser
  componentDidMount() {
    const focused = JSON.parse(localStorage.getItem("focused"));

    if (focused)  {
      this.setState({ focused});
    }
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
          value={panel.value}
          onSelect={event => this.selectPanel(panel.id)}
        />
      ));

    return <main className={dashboardClasses}>{panels}</main>;
  }
}

export default Dashboard;

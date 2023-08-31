"use client";

import styles from "./page.module.css";

import Image from "next/image";
import { useState, useEffect } from "react";

// Every 15 minutes
const REFRESH_INTERVAL = 1000 * 60 * 15;

// All statuspage for now.
const STATUS_URLS = {
  statuspage: [
    "https://confluence.status.atlassian.com/",
    "https://jira-software.status.atlassian.com/",
    "https://status.circleci.com/",
    "https://status.duo.com/",
    "https://status.fury.co/",
    "https://status.npmjs.org/",
    "https://status.python.org/",
    "https://status.splashtop.com/",
    "https://www.githubstatus.com/",
    "https://lucidsoftware.statuspage.io/",
    "https://status.hashicorp.com/",
    "https://status.figma.com/",
    "https://status.openai.com/",
  ],
};

interface StatusPage {
  page: {
    name: string;
    url: string;
  };
  status: {
    indicator: "none" | "minor" | "major" | "critical";
    description: string;
  };
}

const Statuses: React.FC = () => {
  const [countdown, setCountdown] = useState<number>(REFRESH_INTERVAL);
  const [loading, setLoading] = useState<boolean>(true);
  const [statuses, setStatuses] = useState<{ [key: string]: StatusPage }>({});

  const updateStatuses = async () => {
    setLoading(true); // Start loading as soon as we begin updating statuses
    setStatuses({});

    let fetchedStatuses: { [key: string]: StatusPage } = {};

    // Wrap your fetch logic inside a function using async/await
    const fetchStatus = async (url: string): Promise<void> => {
      try {
        const response = await fetch(url + "/api/v2/status.json");
        const result = await response.json();
        fetchedStatuses[result.page.name] = result;
      } catch (err) {
        console.error(err);
      }
    };

    const promises = STATUS_URLS.statuspage.map((url) => fetchStatus(url));

    // Wait for all promises (fetch operations) to complete
    await Promise.all(promises);

    setStatuses(fetchedStatuses);
    setCountdown(REFRESH_INTERVAL);
    setLoading(false); // Stop loading once all fetch operations are done and state is updated
  };

  useEffect(() => {
    updateStatuses(); // Load once

    const statusInterval = setInterval(() => {
      updateStatuses(); // ...and then every so often.
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(statusInterval); // Clean up the interval on component unmount
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCountdown(REFRESH_INTERVAL); // Reset countdown
    } else {
      const countdownInterval = setInterval(() => {
        setCountdown(countdown - 1000);
      }, 1000);

      return () => {
        clearInterval(countdownInterval); // Clean up the interval
      };
    }
  }, [countdown]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <header>
        <h1>Status Check</h1>
        <p>
          Next refresh: {formatTime(countdown)}&nbsp;&mdash;&nbsp;
          <button onClick={updateStatuses}>Refresh Now</button>
        </p>
      </header>
      {loading && <p>Loading...</p>}
      <ul>
        {Object.keys(statuses)
          .sort((a, b) => a.localeCompare(b))
          .map((key: string) => {
            const status = statuses[key];
            return (
              <li
                className={
                  styles.statuspage +
                  " " +
                  styles["status_" + status.status.indicator]
                }
                key={key}
              >
                <a
                  className={styles.link}
                  href={status.page.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className={styles.indicator}></span>
                  <span className={styles.name}>
                    {status.status.indicator !== "none" ? (
                      <strong>{status.page.name}</strong>
                    ) : (
                      status.page.name
                    )}
                  </span>
                  <span className={styles.description}>
                    {status.status.description}
                  </span>
                </a>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

const GitHubLink: React.FC = () => {
  return (
    <div className={styles.github}>
      <a href="https://github.com/ActionScripted/status-status">
        <Image
          alt="GitHub"
          src="https://github.githubassets.com/images/modules/site/icons/footer/github-mark.svg"
          width="20"
          height="20"
        />
      </a>
    </div>
  );
};

export default function Home() {
  return (
    <main className={styles.main}>
      <Statuses />
      <GitHubLink />
    </main>
  );
}

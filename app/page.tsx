"use client";

import styles from "./page.module.css";

import Image from "next/image";
import { useState, useEffect } from "react";

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
  const [statuses, setStatuses] = useState<{ [key: string]: StatusPage }>({});
  const [loading, setLoading] = useState<boolean>(true);

  const REFRESH_INTERVAL = 1000 * 60 * 5;

  const updateStatuses = () => {
    setLoading(true);

    STATUS_URLS.statuspage.forEach((url) => {
      fetch(url + "/api/v2/status.json")
        .then((res) => res.json())
        .then((result) => {
          setStatuses((prevStatuses) => {
            const updatedStatuses = {
              ...prevStatuses,
              [result.page.name]: result,
            };

            return updatedStatuses;
          });
        })
        .catch((err) => console.error(err));
    });

    setLoading(false);
  };

  useEffect(() => {
    // Load once...
    updateStatuses();

    // ...and then every so often.
    setInterval(() => {
      updateStatuses();
    }, REFRESH_INTERVAL);
  }, [REFRESH_INTERVAL]);

  return (
    <div>
      <h1>Status Check</h1>
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

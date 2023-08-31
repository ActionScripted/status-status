"use client";

import styles from "./page.module.css";

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
  const [statuses, setStatuses] = useState<StatusPage[]>([]);

  useEffect(() => {
    STATUS_URLS.statuspage.forEach((url) => {
      fetch(url + "/api/v2/status.json")
        .then((res) => res.json())
        .then((result) => {
          setStatuses((prevStatuses) => {
            const updatedStatuses = [...prevStatuses, result];
            updatedStatuses.sort((a, b) =>
              a.page.name.localeCompare(b.page.name)
            );
            console.log(updatedStatuses);
            return updatedStatuses;
          });
        })
        .catch((err) => console.error(err));
    });
  }, []);

  return (
    <div>
      <h1>Status Check</h1>
      <ul>
        {statuses.map((status, index) => (
          <li
            className={
              styles.statuspage +
              " " +
              styles["status_" + status.status.indicator]
            }
            key={index}
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
        ))}
      </ul>
    </div>
  );
};

export default function Home() {
  return (
    <main className={styles.main}>
      <Statuses />
    </main>
  );
}

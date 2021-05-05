export interface Issue {
  id: number,
  assignee: string | undefined,
  title: string,
  pull_request: {
    url: string,
    html_url: string
  }
}

